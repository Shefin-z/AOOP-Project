package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GroqLearningService {
    private final ObjectMapper mapper;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    @Value("${groq.api-key:}") private String apiKey;
    @Value("${groq.model:openai/gpt-oss-20b}") private String model;

    public GroqLearningService(ObjectMapper mapper) { this.mapper = mapper; }

    public GeminiLearningService.Recommendation recommend(String topic, String pathType) {
        JsonNode response = ask("""
                A student wants to prepare for the %s '%s'. Recommend a realistic number of progressive learning levels from 1 to 50.
                Return JSON only: {"recommendedLevels": number, "reason": "one concise sentence"}.
                """.formatted(pathType, topic));
        return new GeminiLearningService.Recommendation(clamp(response.path("recommendedLevels").asInt(10)), response.path("reason").asText("A focused, progressive practice plan."));
    }

    public GeminiLearningService.GeneratedQuiz generateQuiz(String topic, String pathType, int levelNumber, int levelCount) {
        JsonNode response = ask("""
                Create level %d of %d for a student learning the %s '%s'. Difficulty should progress gradually from beginner to advanced across the levels.
                Return JSON only with exactly this shape: {"title":"short level title","summary":"one sentence","questions":[...]}. Include exactly five questions in this order: two MCQ, one DEBUGGING, one SCENARIO, and one SHORT_ANSWER.
                MCQ, DEBUGGING, and SCENARIO each require: {"type":"MCQ|DEBUGGING|SCENARIO","prompt":"question","codeSnippet":"only for DEBUGGING, otherwise empty","options":["option A","option B","option C","option D"],"answerIndex":0,"explanation":"short explanation"}. Each must have exactly four options and answerIndex 0 through 3.
                SHORT_ANSWER requires: {"type":"SHORT_ANSWER","prompt":"question","expectedKeywords":["keyword one","keyword two","keyword three"],"sampleAnswer":"concise good answer","explanation":"short explanation"}. Use three clear, meaningful keywords that can be checked in a student's answer. Do not include markdown.
                """.formatted(levelNumber, levelCount, pathType, topic));
        ArrayNode questions = response.path("questions") instanceof ArrayNode array ? array : null;
        if (questions == null || questions.size() != 5) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an incomplete level.");
        String[] expectedTypes = {"MCQ", "MCQ", "DEBUGGING", "SCENARIO", "SHORT_ANSWER"};
        for (int index = 0; index < questions.size(); index++) {
            JsonNode question = questions.get(index); String type = question.path("type").asText();
            if (!expectedTypes[index].equals(type) || question.path("prompt").asText().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an invalid question set.");
            if ("SHORT_ANSWER".equals(type)) {
                if (!question.path("expectedKeywords").isArray() || question.path("expectedKeywords").size() < 2 || question.path("sampleAnswer").asText().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an incomplete short-answer question.");
            } else if (!question.path("options").isArray() || question.path("options").size() != 4 || question.path("answerIndex").asInt(-1) < 0 || question.path("answerIndex").asInt(-1) > 3) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an invalid question set.");
            }
        }
        return new GeminiLearningService.GeneratedQuiz(response.path("title").asText("Level " + levelNumber), response.path("summary").asText("Practice and pass to unlock the next level."), questions);
    }

    private JsonNode ask(String prompt) {
        if (apiKey == null || apiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq is not configured.");
        ObjectNode request = mapper.createObjectNode(); request.put("model", model.trim()); request.put("temperature", 0.25);
        request.putObject("response_format").put("type", "json_object");
        ArrayNode messages = request.putArray("messages");
        messages.addObject().put("role", "system").put("content", "You are a precise CareerForge assessment generator. Return valid JSON only, matching the requested schema.");
        messages.addObject().put("role", "user").put("content", prompt);
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(40)).header("Content-Type", "application/json").header("Authorization", "Bearer " + apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request))).build();
            HttpResponse<String> response = http.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Groq's rate limit is temporarily reached.");
            if (response.statusCode() < 200 || response.statusCode() >= 300) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq request failed: " + response.statusCode() + ".");
            String text = mapper.readTree(response.body()).path("choices").path(0).path("message").path("content").asText();
            if (text.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq did not return a usable response.");
            return mapper.readTree(text.replace("```json", "").replace("```", "").trim());
        } catch (Exception exception) {
            if (exception instanceof ResponseStatusException responseStatusException) throw responseStatusException;
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not read Groq's response.");
        }
    }

    private int clamp(int value) { return Math.max(1, Math.min(50, value)); }
}
