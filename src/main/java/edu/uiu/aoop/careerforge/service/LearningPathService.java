package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper mapper;
    public LearningPathService(LearningPathRepository paths, LearningLevelRepository levels, LearningAttemptRepository attempts, AccessService access, GeminiLearningService gemini, ObjectMapper mapper) { this.paths = paths; this.levels = levels; this.attempts = attempts; this.access = access; this.gemini = gemini; this.mapper = mapper; }

    @Transactional(readOnly = true)
    public List<LearningPathResponse> list(Long userId) { access.requireStudent(userId); return paths.findByUserIdOrderByCreatedAtDesc(userId).stream().map(path -> response(path, userId)).toList(); }
    public LearningPathResponse create(Long userId, LearningPathRequest request) {
        access.requireStudent(userId);
        LearningPath path = paths.save(new LearningPath(userId, request.topic().trim(), request.pathType(), request.levelCount()));
        for (int number = 1; number <= request.levelCount(); number++) levels.save(new LearningLevel(path, number));
        return response(path, userId);
    }
    public LearningRecommendationResponse recommend(Long userId, String topic, String pathType) { access.requireStudent(userId); GeminiLearningService.Recommendation recommendation = gemini.recommend(topic.trim(), pathType); return new LearningRecommendationResponse(recommendation.recommendedLevels(), recommendation.reason()); }
    public LearningPathResponse get(Long userId, Long pathId) { access.requireStudent(userId); return response(path(userId, pathId), userId); }
    public void delete(Long userId, Long pathId) { access.requireStudent(userId); paths.delete(path(userId, pathId)); }
    public LearningQuizResponse quiz(Long userId, Long pathId, int levelNumber) {
        access.requireStudent(userId); LearningPath path = path(userId, pathId); LearningLevel level = level(path, levelNumber); int unlocked = nextUnlocked(path, userId);
        if (levelNumber > unlocked) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pass the previous level with at least 70% to unlock this one.");
        if (level.getQuestionSet() == null) { GeminiLearningService.GeneratedQuiz generated = gemini.generateQuiz(path.getTopic(), path.getPathType(), levelNumber, path.getLevelCount()); try { level.setQuestionSet(mapper.writeValueAsString(Map.of("title", generated.title(), "summary", generated.summary(), "questions", generated.questions()))); levels.save(level); } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the generated questions."); } }
        return quizResponse(level);
    }
    public LearningAttemptResponse submit(Long userId, Long pathId, int levelNumber, LearningAttemptRequest request) {
        access.requireStudent(userId); LearningPath path = path(userId, pathId); LearningLevel level = level(path, levelNumber); int unlocked = nextUnlocked(path, userId);
        if (levelNumber > unlocked) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pass the previous level with at least 70% to unlock this one.");
        JsonNode questionSet = questions(level); JsonNode questions = questionSet.path("questions");
        if (!questions.isArray() || questions.size() != request.answers().size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer every question before submitting.");
        int correct = 0; List<LearningAttemptResponse.QuestionResult> results = new java.util.ArrayList<>();
        for (int index = 0; index < questions.size(); index++) {
            JsonNode question = questions.get(index); int selectedIndex = request.answers().get(index); int correctIndex = question.path("answerIndex").asInt(-1); JsonNode options = question.path("options"); boolean answerCorrect = correctIndex == selectedIndex;
            if (answerCorrect) correct++;
            String selectedAnswer = selectedIndex >= 0 && selectedIndex < options.size() ? options.path(selectedIndex).asText() : "No answer selected";
            results.add(new LearningAttemptResponse.QuestionResult(index + 1, question.path("prompt").asText(), selectedAnswer, options.path(correctIndex).asText(), answerCorrect, question.path("explanation").asText("Review this concept before you retry.")));
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
        List<LearningQuizResponse.Question> questions = java.util.stream.IntStream.range(0, items.size()).mapToObj(index -> { JsonNode item = items.get(index); List<String> options = new java.util.ArrayList<>(); item.path("options").forEach(option -> options.add(option.asText())); return new LearningQuizResponse.Question(index, item.path("prompt").asText(), options); }).toList();
        return new LearningQuizResponse(level.getLevelNumber(), root.path("title").asText("Level " + level.getLevelNumber()), root.path("summary").asText(), questions);
    }
}
