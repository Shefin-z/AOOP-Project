package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import edu.uiu.aoop.careerforge.dto.LearningAttemptRequest;
import edu.uiu.aoop.careerforge.dto.LearningAttemptResponse;
import edu.uiu.aoop.careerforge.dto.LearningPathRequest;
import edu.uiu.aoop.careerforge.dto.LearningPathResponse;
import edu.uiu.aoop.careerforge.dto.LearningQuizResponse;
import edu.uiu.aoop.careerforge.dto.LearningRecommendationResponse;
import edu.uiu.aoop.careerforge.model.LearningAttempt;
import edu.uiu.aoop.careerforge.model.LearningLevel;
import edu.uiu.aoop.careerforge.model.LearningPath;
import edu.uiu.aoop.careerforge.repository.LearningAttemptRepository;
import edu.uiu.aoop.careerforge.repository.LearningLevelRepository;
import edu.uiu.aoop.careerforge.repository.LearningPathRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class LearningPathService {
    private static final BigDecimal PASSING_SCORE = BigDecimal.valueOf(70);
    private final LearningPathRepository paths;
    private final LearningLevelRepository levels;
    private final LearningAttemptRepository attempts;
    private final AccessService access;
    private final GeminiLearningService gemini;
    private final GroqLearningService groq;
    private final ObjectMapper mapper;
    public LearningPathService(LearningPathRepository paths, LearningLevelRepository levels, LearningAttemptRepository attempts, AccessService access, GeminiLearningService gemini, GroqLearningService groq, ObjectMapper mapper) { this.paths = paths; this.levels = levels; this.attempts = attempts; this.access = access; this.gemini = gemini; this.groq = groq; this.mapper = mapper; }

    @Transactional(readOnly = true)
    public List<LearningPathResponse> list(Long userId) { access.requireStudent(userId); return paths.findByUserIdOrderByCreatedAtDesc(userId).stream().map(path -> response(path, userId)).toList(); }
    public LearningPathResponse create(Long userId, LearningPathRequest request) {
        access.requireStudent(userId);
        LearningPath path = paths.save(new LearningPath(userId, request.topic().trim(), request.pathType(), request.levelCount()));
        for (int number = 1; number <= request.levelCount(); number++) levels.save(new LearningLevel(path, number));
        return response(path, userId);
    }
    public LearningRecommendationResponse recommend(Long userId, String topic, String pathType) { access.requireStudent(userId); GeminiLearningService.Recommendation recommendation; try { recommendation = gemini.recommend(topic.trim(), pathType); } catch (ResponseStatusException exception) { recommendation = groq.recommend(topic.trim(), pathType); } return new LearningRecommendationResponse(recommendation.recommendedLevels(), recommendation.reason()); }
    public LearningPathResponse get(Long userId, Long pathId) { access.requireStudent(userId); return response(path(userId, pathId), userId); }
    public void delete(Long userId, Long pathId) { access.requireStudent(userId); paths.delete(path(userId, pathId)); }
    public LearningQuizResponse quiz(Long userId, Long pathId, int levelNumber) {
        access.requireStudent(userId); LearningPath path = path(userId, pathId); LearningLevel level = level(path, levelNumber); int unlocked = nextUnlocked(path, userId);
        if (levelNumber > unlocked) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pass the previous level with at least 70% to unlock this one.");
        if (level.getQuestionSet() == null || questions(level).path("assessmentVersion").asInt() < 2) { GeminiLearningService.GeneratedQuiz generated; try { generated = gemini.generateQuiz(path.getTopic(), path.getPathType(), levelNumber, path.getLevelCount()); } catch (ResponseStatusException geminiFailure) { try { generated = groq.generateQuiz(path.getTopic(), path.getPathType(), levelNumber, path.getLevelCount()); } catch (ResponseStatusException groqFailure) { generated = fallbackQuiz(path.getTopic(), levelNumber); } } try { level.setQuestionSet(mapper.writeValueAsString(Map.of("assessmentVersion", 2, "title", generated.title(), "summary", generated.summary(), "questions", generated.questions()))); levels.save(level); } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the generated questions."); } }
        return quizResponse(level);
    }
    public LearningQuizResponse regenerate(Long userId, Long pathId, int levelNumber) {
        access.requireStudent(userId); LearningPath path = path(userId, pathId); LearningLevel level = level(path, levelNumber);
        if (levelNumber > nextUnlocked(path, userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pass the previous level with at least 70% to unlock this one.");
        level.setQuestionSet(null); levels.save(level);
        return quiz(userId, pathId, levelNumber);
    }
    public LearningAttemptResponse submit(Long userId, Long pathId, int levelNumber, LearningAttemptRequest request) {
        access.requireStudent(userId); LearningPath path = path(userId, pathId); LearningLevel level = level(path, levelNumber); int unlocked = nextUnlocked(path, userId);
        if (levelNumber > unlocked) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pass the previous level with at least 70% to unlock this one.");
        JsonNode questionSet = questions(level); JsonNode questions = questionSet.path("questions");
        if (!questions.isArray() || questions.size() != request.answers().size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer every question before submitting.");
        int correct = 0; List<LearningAttemptResponse.QuestionResult> results = new java.util.ArrayList<>();
        for (int index = 0; index < questions.size(); index++) {
            JsonNode question = questions.get(index); String submittedAnswer = request.answers().get(index); String type = question.path("type").asText("MCQ"); JsonNode options = question.path("options");
            int selectedIndex = parseOptionIndex(submittedAnswer); int correctIndex = question.path("answerIndex").asInt(-1);
            boolean answerCorrect = "SHORT_ANSWER".equals(type) ? matchesKeywords(submittedAnswer, question.path("expectedKeywords")) : correctIndex == selectedIndex;
            if (answerCorrect) correct++;
            String selectedAnswer = "SHORT_ANSWER".equals(type) ? submittedAnswer : selectedIndex >= 0 && selectedIndex < options.size() ? options.path(selectedIndex).asText() : "No answer selected";
            String correctAnswer = "SHORT_ANSWER".equals(type) ? question.path("sampleAnswer").asText("Include the key concepts in your explanation.") : options.path(correctIndex).asText();
            results.add(new LearningAttemptResponse.QuestionResult(index + 1, question.path("prompt").asText(), selectedAnswer, correctAnswer, answerCorrect, question.path("explanation").asText("Review this concept before you retry.")));
        }
        BigDecimal percentage = BigDecimal.valueOf(correct * 100.0 / questions.size()).setScale(2, RoundingMode.HALF_UP); boolean passed = percentage.compareTo(PASSING_SCORE) >= 0;
        try { attempts.save(new LearningAttempt(level, userId, correct, questions.size(), percentage, passed, mapper.writeValueAsString(request.answers()))); } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save this level attempt."); }
        int next = nextUnlocked(path, userId);
        String message = passed ? (next > path.getLevelCount() ? "Excellent — you completed this learning path." : "Passed! The next level is now unlocked.") : "You need 70% to unlock the next level. Review the explanations and try again.";
        return new LearningAttemptResponse(correct, questions.size(), percentage, passed, next, message, results);
    }
    private LearningPath path(Long userId, Long pathId) { return paths.findByIdAndUserId(pathId, userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learning path not found.")); }
    private LearningLevel level(LearningPath path, int number) { return levels.findByPathIdAndLevelNumber(path.getId(), number).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Level not found.")); }
    private LearningPathResponse response(LearningPath path, Long userId) {
        List<LearningLevel> pathLevels = levels.findByPathIdOrderByLevelNumber(path.getId()); List<LearningAttempt> pathAttempts = attempts.findByLevelPathIdAndUserId(path.getId(), userId);
        Map<Integer, BigDecimal> bestScores = new HashMap<>(); Set<Integer> passedLevels = new HashSet<>();
        for (LearningAttempt attempt : pathAttempts) { int number = attempt.getLevel().getLevelNumber(); bestScores.merge(number, attempt.getPercentage(), BigDecimal::max); if (attempt.isPassed()) passedLevels.add(number); }
        int next = 1; while (passedLevels.contains(next) && next <= path.getLevelCount()) next++;
        int unlocked = Math.min(next, path.getLevelCount() + 1);
        List<LearningPathResponse.Level> levelResponses = pathLevels.stream().map(level -> new LearningPathResponse.Level(level.getLevelNumber(), passedLevels.contains(level.getLevelNumber()) ? "completed" : level.getLevelNumber() == unlocked ? "available" : "locked", bestScores.get(level.getLevelNumber()))).toList();
        return new LearningPathResponse(path.getId(), path.getTopic(), path.getPathType(), path.getLevelCount(), unlocked, path.getCreatedAt(), levelResponses);
    }
    private int nextUnlocked(LearningPath path, Long userId) { return response(path, userId).nextUnlockedLevel(); }
    private JsonNode questions(LearningLevel level) { if (level.getQuestionSet() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Open the level first so Gemini can generate its questions."); try { return mapper.readTree(level.getQuestionSet()); } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Saved questions are invalid."); } }
    private LearningQuizResponse quizResponse(LearningLevel level) {
        JsonNode root = questions(level); JsonNode items = root.path("questions");
        List<LearningQuizResponse.Question> questions = java.util.stream.IntStream.range(0, items.size()).mapToObj(index -> { JsonNode item = items.get(index); List<String> options = new java.util.ArrayList<>(); item.path("options").forEach(option -> options.add(option.asText())); String type = item.path("type").asText("MCQ"); String answerHint = "SHORT_ANSWER".equals(type) ? "Mention the key concepts in your own words." : ""; return new LearningQuizResponse.Question(index, type, item.path("prompt").asText(), item.path("codeSnippet").asText(), options, answerHint); }).toList();
        return new LearningQuizResponse(level.getLevelNumber(), root.path("title").asText("Level " + level.getLevelNumber()), root.path("summary").asText(), questions);
    }
    private int parseOptionIndex(String answer) { try { return Integer.parseInt(answer); } catch (Exception exception) { return -1; } }
    private boolean matchesKeywords(String answer, JsonNode keywords) {
        if (answer == null || answer.isBlank() || !keywords.isArray()) return false;
        String normalized = answer.toLowerCase(); int matches = 0;
        for (JsonNode keyword : keywords) if (!keyword.asText().isBlank() && normalized.contains(keyword.asText().toLowerCase())) matches++;
        return matches >= Math.min(2, keywords.size());
    }
    private GeminiLearningService.GeneratedQuiz fallbackQuiz(String topic, int levelNumber) {
        String[] focusAreas = {"core concepts", "variables and data", "control flow", "methods and problem solving", "object-oriented design", "collections and data handling", "errors and exceptions", "files and persistence", "performance and clean code", "real project practice"};
        String focus = focusAreas[Math.floorMod(levelNumber - 1 + (int) (System.currentTimeMillis() / 1000L), focusAreas.length)];
        ArrayNode items = mapper.createArrayNode();
        items.add(objectiveQuestion("MCQ", "Which is the best approach for building " + focus + " in " + topic + "?", "", List.of("Understand the idea and practise it with small examples", "Skip directly to unrelated advanced topics", "Memorise answers without practising", "Avoid feedback"), 0, "A strong foundation and short practice cycles build reliable skill."));
        items.add(objectiveQuestion("MCQ", "Which habit helps you improve your " + focus + " in " + topic + " most consistently?", "", List.of("Practise regularly and review mistakes", "Only study once before an exam", "Ignore errors", "Copy solutions without understanding them"), 0, "Consistent practice and review reveal what to improve next."));
        items.add(objectiveQuestion("DEBUGGING", "Review this code. What should be fixed first?", "int total = 10;\nint average = total / 0;\nSystem.out.println(average);", List.of("Avoid division by zero", "Rename the variable", "Remove the print statement", "Add another variable"), 0, "Division by zero causes a runtime error and must be guarded."));
        items.add(objectiveQuestion("SCENARIO", "You are building a small " + topic + " project focused on " + focus + " and the result is not what you expected. What is the best next action?", "", List.of("Reproduce the issue, inspect the inputs, and test one change at a time", "Change many things at once", "Ignore the result", "Start over without checking the cause"), 0, "A small, repeatable investigation makes problems easier to solve."));
        ObjectNode shortAnswer = items.addObject(); shortAnswer.put("type", "SHORT_ANSWER"); shortAnswer.put("prompt", "In your own words, explain one useful " + focus + " concept in " + topic + " and give a practical example."); shortAnswer.putArray("expectedKeywords").add("concept").add("example").add("practice"); shortAnswer.put("sampleAnswer", "A good answer names a concept, explains it clearly, and shows how it can be used in practice."); shortAnswer.put("explanation", "Strong explanations connect a concept to a real example and practical use.");
        return new GeminiLearningService.GeneratedQuiz(topic + " foundations", "Gemini is temporarily busy, so this level uses a focused practice set while keeping your progress available.", items);
    }
    private ObjectNode objectiveQuestion(String type, String prompt, String codeSnippet, List<String> options, int answerIndex, String explanation) {
        ObjectNode question = mapper.createObjectNode(); question.put("type", type); question.put("prompt", prompt); question.put("codeSnippet", codeSnippet); ArrayNode optionNodes = question.putArray("options"); options.forEach(optionNodes::add); question.put("answerIndex", answerIndex); question.put("explanation", explanation); return question;
    }
}
