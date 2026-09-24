package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GeminiLearningService {
    private final ObjectMapper mapper;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    @Value("${gemini.api-key:}") private String apiKey;
    @Value("${gemini.model:gemini-2.5-flash}") private String model;
    public GeminiLearningService(ObjectMapper mapper) { this.mapper = mapper; }

    public Recommendation recommend(String topic, String pathType) {
        JsonNode response = ask("""
                You are a learning-path coach. A student wants to prepare for the %s '%s'.
                Assess the topic's breadth, prerequisites, and practical depth before recommending a realistic number of progressive learning levels from 1 to 50. Do not default to a fixed number; the level count must fit this specific topic and its job-readiness needs.
                Return JSON only: {"recommendedLevels": number, "reason": "one concise sentence"}.
                """.formatted(pathType, topic), Duration.ofSeconds(20), 1);
        return new Recommendation(clamp(response.path("recommendedLevels").asInt(10)), response.path("reason").asText("A focused, progressive practice plan."));
    }

    public GeneratedQuiz generateQuiz(String topic, String pathType, int levelNumber, int levelCount) {
        JsonNode response = ask("""
                Create level %d of %d for a student learning the %s '%s'. Difficulty should progress gradually from beginner to advanced across the levels.
                Return JSON only with exactly this shape: {"title":"short level title","summary":"one sentence","questions":[...]}. Include exactly five questions in this order: two MCQ, one DEBUGGING, one SCENARIO, and one SHORT_ANSWER.
                MCQ, DEBUGGING, and SCENARIO each require: {"type":"MCQ|DEBUGGING|SCENARIO","prompt":"question","codeSnippet":"only for DEBUGGING, otherwise empty","options":["option A","option B","option C","option D"],"answerIndex":0,"explanation":"short explanation"}. Each must have exactly four options and answerIndex 0 through 3.
                SHORT_ANSWER requires: {"type":"SHORT_ANSWER","prompt":"question","expectedKeywords":["keyword one","keyword two","keyword three"],"sampleAnswer":"concise good answer","explanation":"short explanation"}. Use three clear, meaningful keywords that can be checked in a student's answer. Do not include markdown.
                """.formatted(levelNumber, levelCount, pathType, topic));
        ArrayNode questions = response.path("questions") instanceof ArrayNode array ? array : null;
        if (questions == null || questions.size() != 5) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an incomplete level. Please generate it again.");
        String[] expectedTypes = {"MCQ", "MCQ", "DEBUGGING", "SCENARIO", "SHORT_ANSWER"};
        for (int index = 0; index < questions.size(); index++) {
            JsonNode question = questions.get(index); String type = question.path("type").asText();
            if (!expectedTypes[index].equals(type) || question.path("prompt").asText().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an invalid question set. Please generate it again.");
            if ("SHORT_ANSWER".equals(type)) {
                if (!question.path("expectedKeywords").isArray() || question.path("expectedKeywords").size() < 2 || question.path("sampleAnswer").asText().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an incomplete short-answer question. Please generate it again.");
            } else if (!question.path("options").isArray() || question.path("options").size() != 4 || question.path("answerIndex").asInt(-1) < 0 || question.path("answerIndex").asInt(-1) > 3) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an invalid question set. Please generate it again.");
            }
        }
        return new GeneratedQuiz(response.path("title").asText("Level " + levelNumber), response.path("summary").asText("Practice and pass to unlock the next level."), questions);
    }

    private JsonNode ask(String prompt) { return ask(prompt, Duration.ofSeconds(40), 3); }

    private JsonNode ask(String prompt, Duration requestTimeout, int maxAttempts) {
        if (apiKey == null || apiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini is not configured. Add GEMINI_API_KEY to the backend environment and restart it.");
        ObjectNode request = mapper.createObjectNode();
        ArrayNode contents = request.putArray("contents");
        contents.addObject().putArray("parts").addObject().put("text", prompt);
        ObjectNode generationConfig = request.putObject("generationConfig"); generationConfig.put("temperature", 0.25); generationConfig.put("responseMimeType", "application/json");
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + model.trim() + ":generateContent"))
                    .timeout(requestTimeout).header("Content-Type", "application/json").header("x-goog-api-key", apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request))).build();
            for (int attempt = 0; attempt < maxAttempts; attempt++) {
                HttpResponse<String> response = http.send(httpRequest, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 503 && attempt < maxAttempts - 1) {
                    Thread.sleep((attempt + 1L) * 1500L);
                    continue;
                }
                if (response.statusCode() == 429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Gemini's rate limit is temporarily reached. Please try again shortly.");
                if (response.statusCode() < 200 || response.statusCode() >= 300) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini request failed: " + response.statusCode() + ". Check the API key and model.");
                String text = mapper.readTree(response.body()).path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
                if (text.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini did not return a usable response.");
                return mapper.readTree(text.replace("```json", "").replace("```", "").trim());
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini is temporarily unavailable. Please try again in a moment.");
        }
        catch (Exception exception) { if (exception instanceof ResponseStatusException responseStatusException) throw responseStatusException; throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not read Gemini's response. Please try again."); }
    }
    private int clamp(int value) { return Math.max(1, Math.min(50, value)); }
    public record Recommendation(int recommendedLevels, String reason) { }
    public record GeneratedQuiz(String title, String summary, ArrayNode questions) { }
}
