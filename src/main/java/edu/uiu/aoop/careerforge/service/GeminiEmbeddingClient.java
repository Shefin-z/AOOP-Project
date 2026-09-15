package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.time.Duration;

/** REST client for Gemini Embedding 2. Kept separate from the generative Gemini learning client. */
@Service
public class GeminiEmbeddingClient {
    private final ObjectMapper mapper;
    private final RestTemplate http;
    private final String apiKey;
    private final String model;
    private final int dimensions;
    private final long minimumIntervalMs;
    private final Object requestLock = new Object();
    private long nextRequestAt;

    public GeminiEmbeddingClient(ObjectMapper mapper,
                                 @Value("${gemini.api-key:}") String apiKey,
                                 @Value("${gemini.embedding-model:gemini-embedding-2}") String model,
                                 @Value("${gemini.embedding-dimensions:768}") int dimensions,
                                 @Value("${gemini.embedding-min-interval-ms:1100}") long minimumIntervalMs) {
        this.mapper = mapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model == null || model.isBlank() ? "gemini-embedding-2" : model.trim();
        this.dimensions = dimensions < 128 ? 768 : Math.min(3072, dimensions);
        this.minimumIntervalMs = Math.max(250, minimumIntervalMs);
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        this.http = new RestTemplate(requestFactory);
    }

    public String model() { return model; }
    public int dimensions() { return dimensions; }
    public boolean configured() { return !apiKey.isBlank(); }

    public List<Double> embedDocument(String title, String text) {
        return request("title: " + clean(title) + " | text: " + clean(text));
    }

    public List<Double> embedQuery(String query) {
        return request("task: search result | query: " + clean(query));
    }

    private List<Double> request(String text) {
        if (apiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini embedding is not configured. Add GEMINI_API_KEY and restart the backend.");
        ObjectNode body = mapper.createObjectNode();
        body.put("model", "models/" + model);
        body.putObject("content").putArray("parts").addObject().put("text", text);
        body.put("output_dimensionality", dimensions);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        for (int attempt = 1; attempt <= 3; attempt++) {
            paceRequests();
            try {
                ResponseEntity<JsonNode> response = http.exchange("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":embedContent", HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class);
                return embeddingValues(response.getBody());
            } catch (RestClientResponseException exception) {
                if (exception.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS && attempt < 3) {
                    pause(2000L * attempt);
                    continue;
                }
                HttpStatus status = exception.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.BAD_GATEWAY;
                throw new ResponseStatusException(status, "Gemini embedding request failed: " + exception.getStatusCode() + ".");
            } catch (ResponseStatusException exception) { throw exception; }
            catch (Exception exception) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not read Gemini's embedding response."); }
        }
        throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Gemini embedding rate limit reached. Please retry shortly.");
    }

    private List<Double> embeddingValues(JsonNode root) {
        JsonNode values = root == null ? null : root.path("embedding").path("values");
        if (values == null || !values.isArray() || values.isEmpty()) values = root == null ? null : root.path("embeddings").path(0).path("values");
        if (values == null || !values.isArray() || values.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty embedding.");
        List<Double> result = new ArrayList<>();
        values.forEach(value -> result.add(value.asDouble()));
        return result;
    }

    private void paceRequests() {
        synchronized (requestLock) {
            long now = System.currentTimeMillis();
            pause(Math.max(0, nextRequestAt - now));
            nextRequestAt = Math.max(now, nextRequestAt) + minimumIntervalMs;
        }
    }

    private void pause(long milliseconds) {
        if (milliseconds <= 0) return;
        try { Thread.sleep(milliseconds); }
        catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini embedding request was interrupted.");
        }
    }

    private String clean(String value) { return value == null ? "" : value.replaceAll("\\s+", " ").trim(); }
}
