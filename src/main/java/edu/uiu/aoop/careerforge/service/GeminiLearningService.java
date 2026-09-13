package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class GeminiLearningService {
    private final ObjectMapper mapper;
    private final RestTemplate http = new RestTemplate();
    @Value("${gemini.api-key:}") private String apiKey;
    @Value("${gemini.model:gemini-2.5-flash}") private String model;
    public GeminiLearningService(ObjectMapper mapper) { this.mapper = mapper; }

    public Recommendation recommend(String topic, String pathType) {
        JsonNode response = ask("""
                You are a learning-path coach. A student wants to prepare for the %s '%s'.
                Recommend a realistic number of progressive learning levels from 1 to 50.
                Return JSON only: {"recommendedLevels": number, "reason": "one concise sentence"}.
                """.formatted(pathType, topic));
        return new Recommendation(clamp(response.path("recommendedLevels").asInt(10)), response.path("reason").asText("A focused, progressive practice plan."));
    }

    public GeneratedQuiz generateQuiz(String topic, String pathType, int levelNumber, int levelCount) {
        JsonNode response = ask("""
                Create level %d of %d for a student learning the %s '%s'. Difficulty should progress gradually from beginner to advanced across the levels.
                Return JSON only with exactly this shape: {"title":"short level title","summary":"one sentence","questions":[{"prompt":"question","options":["option A","option B","option C","option D"],"answerIndex":0,"explanation":"short explanation"}]}. Include exactly 5 multiple-choice questions. Each question must have exactly 4 options and answerIndex must be 0, 1, 2, or 3. Do not include markdown.
                """.formatted(levelNumber, levelCount, pathType, topic));
        ArrayNode questions = response.path("questions") instanceof ArrayNode array ? array : null;
        if (questions == null || questions.size() != 5) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an incomplete level. Please generate it again.");
        for (JsonNode question : questions) {
            if (question.path("prompt").asText().isBlank() || !question.path("options").isArray() || question.path("options").size() != 4 || question.path("answerIndex").asInt(-1) < 0 || question.path("answerIndex").asInt(-1) > 3) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an invalid question set. Please generate it again.");
        }
        return new GeneratedQuiz(response.path("title").asText("Level " + levelNumber), response.path("summary").asText("Practice and pass to unlock the next level."), questions);
    }

    private JsonNode ask(String prompt) {
        if (apiKey == null || apiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini is not configured. Add GEMINI_API_KEY to the backend environment and restart it.");
        ObjectNode request = mapper.createObjectNode();
        ArrayNode contents = request.putArray("contents");
        contents.addObject().putArray("parts").addObject().put("text", prompt);
        ObjectNode generationConfig = request.putObject("generationConfig"); generationConfig.put("temperature", 0.25); generationConfig.put("responseMimeType", "application/json");
        HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON); headers.set("x-goog-api-key", apiKey.trim());
        try {
            ResponseEntity<JsonNode> response = http.exchange("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", HttpMethod.POST, new HttpEntity<>(request, headers), JsonNode.class);
            String text = response.getBody() == null ? "" : response.getBody().path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            if (text.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini did not return a usable response.");
            return mapper.readTree(text.replace("```json", "").replace("```", "").trim());
        } catch (RestClientResponseException exception) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini request failed: " + exception.getStatusCode() + ". Check the API key and model."); }
        catch (Exception exception) { if (exception instanceof ResponseStatusException responseStatusException) throw responseStatusException; throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not read Gemini's response. Please try again."); }
    }
    private int clamp(int value) { return Math.max(1, Math.min(50, value)); }
    public record Recommendation(int recommendedLevels, String reason) { }
    public record GeneratedQuiz(String title, String summary, ArrayNode questions) { }
}
