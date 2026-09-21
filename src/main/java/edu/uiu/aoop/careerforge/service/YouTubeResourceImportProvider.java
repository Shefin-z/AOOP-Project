package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Searches YouTube and imports the three strongest matching public playlists as drafts. */
@Service
@Transactional
public class YouTubeResourceImportProvider implements ResourceImportProvider {
    private static final String SOURCE = "YouTube Playlist Search";
    private static final int CANDIDATE_LIMIT = 10;
    private static final int SAMPLE_VIDEO_LIMIT = 5;

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String apiKey;

    public YouTubeResourceImportProvider(JdbcTemplate jdbc, ObjectMapper mapper,
                                         @Value("${youtube.api-key:}") String apiKey) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    @Override
    public int importResources(Long adminId, String query) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "YouTube is not configured. Add YOUTUBE_API_KEY to .env, then restart the backend.");
        }
        String topic = query == null ? "" : query.trim();
        if (topic.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a topic to search YouTube playlists.");
        }
        try {
            List<Candidate> candidates = rankCandidates(search(topic));
            int imported = 0;
            for (Candidate candidate : candidates.stream().limit(3).toList()) {
                if (saveDraft(adminId, candidate.item(), topic)) imported++;
            }
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not import YouTube playlists. Check the API key or quota.");
        }
    }

    /** Search keeps YouTube's relevance signal, then we enrich and re-rank those candidates. */
    private List<Candidate> rankCandidates(JsonNode items) throws Exception {
        List<JsonNode> searchItems = new ArrayList<>();
        for (JsonNode item : items) {
            if (!item.path("id").path("playlistId").asText().isBlank()) searchItems.add(item);
        }
        if (searchItems.isEmpty()) return List.of();

        List<String> playlistIds = searchItems.stream()
                .map(item -> item.path("id").path("playlistId").asText())
                .toList();
        Map<String, Integer> itemCounts = playlistDetails(playlistIds);
        Map<String, List<String>> sampledVideos = new HashMap<>();
        Set<String> allVideoIds = new HashSet<>();
        for (String playlistId : playlistIds) {
            List<String> ids = playlistVideos(playlistId);
            sampledVideos.put(playlistId, ids);
            allVideoIds.addAll(ids);
        }
        Map<String, Stats> stats = videoStats(new ArrayList<>(allVideoIds));

        List<Candidate> ranked = new ArrayList<>();
        int count = searchItems.size();
        for (int index = 0; index < count; index++) {
            JsonNode item = searchItems.get(index);
            String playlistId = item.path("id").path("playlistId").asText();
            List<Stats> videoStats = sampledVideos.getOrDefault(playlistId, List.of()).stream()
                    .map(stats::get).filter(java.util.Objects::nonNull).toList();
            double averageViews = videoStats.stream().mapToLong(Stats::views).average().orElse(0d);
            double averageEngagement = videoStats.stream()
                    .mapToDouble(stat -> (stat.likes() + stat.comments()) / (double) Math.max(stat.views(), 1L))
                    .average().orElse(0d);
            double relevance = count == 1 ? 1d : (count - index) / (double) count;
            double popularity = Math.min(1d, Math.log10(averageViews + 1d) / 7d);
            double engagement = Math.min(1d, Math.log10(averageEngagement * 10000d + 1d) / 4d);
            double depth = Math.min(1d, Math.log10(itemCounts.getOrDefault(playlistId, 0) + 1d) / 3d);
            double score = 0.55d * relevance + 0.25d * popularity + 0.12d * engagement + 0.08d * depth;
            ranked.add(new Candidate(item, score));
        }
        ranked.sort(Comparator.comparingDouble(Candidate::score).reversed());
        return ranked;
    }

    private JsonNode search(String topic) throws Exception {
        String query = "part=snippet&type=playlist&order=relevance&maxResults=" + CANDIDATE_LIMIT
                + "&safeSearch=strict&q=" + encode(topic) + "&regionCode=BD&key=" + encode(apiKey);
        return get("search", "playlist search", query).path("items");
    }

    private Map<String, Integer> playlistDetails(List<String> ids) throws Exception {
        if (ids.isEmpty()) return Map.of();
        String query = "part=contentDetails&id=" + encode(String.join(",", ids)) + "&key=" + encode(apiKey);
        JsonNode items = get("playlists", "playlist details", query).path("items");
        Map<String, Integer> result = new HashMap<>();
        for (JsonNode item : items) result.put(item.path("id").asText(), item.path("contentDetails").path("itemCount").asInt(0));
        return result;
    }

    private List<String> playlistVideos(String playlistId) throws Exception {
        String query = "part=contentDetails&playlistId=" + encode(playlistId)
                + "&maxResults=" + SAMPLE_VIDEO_LIMIT + "&key=" + encode(apiKey);
        JsonNode items = get("playlistItems", "playlist videos", query).path("items");
        List<String> result = new ArrayList<>();
        for (JsonNode item : items) {
            String videoId = item.path("contentDetails").path("videoId").asText();
            if (!videoId.isBlank()) result.add(videoId);
        }
        return result;
    }

    private Map<String, Stats> videoStats(List<String> ids) throws Exception {
        if (ids.isEmpty()) return Map.of();
        String query = "part=statistics&id=" + encode(String.join(",", ids)) + "&key=" + encode(apiKey);
        JsonNode items = get("videos", "video statistics", query).path("items");
        Map<String, Stats> result = new HashMap<>();
        for (JsonNode item : items) {
            JsonNode statistics = item.path("statistics");
            result.put(item.path("id").asText(), new Stats(
                    statistics.path("viewCount").asLong(0),
                    statistics.path("likeCount").asLong(0),
                    statistics.path("commentCount").asLong(0)));
        }
        return result;
    }

    private JsonNode get(String endpoint, String operation, String query) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/" + endpoint + "?" + query))
                .GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 400 || response.statusCode() == 401
                || response.statusCode() == 403 || response.statusCode() == 429) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "YouTube rejected the " + operation + ". Check YOUTUBE_API_KEY, API access, or quota.");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "YouTube " + operation + " could not be reached right now.");
        }
        return mapper.readTree(response.body());
    }

    private boolean saveDraft(Long adminId, JsonNode item, String topic) {
        JsonNode snippet = item.path("snippet");
        String playlistId = item.path("id").path("playlistId").asText();
        String title = clean(snippet.path("title").asText());
        if (playlistId.isBlank() || title.isBlank()) return false;
        String url = "https://www.youtube.com/playlist?list=" + playlistId;
        String description = clean(snippet.path("description").asText());
        String providerName = clean(snippet.path("channelTitle").asText());
        String thumbnailUrl = thumbnail(snippet);
        Integer existing = jdbc.query("select id from learning_resources where source = ? and external_id = ?",
                rs -> rs.next() ? rs.getInt("id") : null, SOURCE, playlistId);
        if (existing != null) {
            jdbc.update("update learning_resources set title=?, description=?, category=?, resource_type=?, resource_url=?, thumbnail_url=?, provider_name=? where id=?",
                    limit(title, 220), description, limit(topic, 120), "course", url, thumbnailUrl, providerName, existing);
            return false;
        }
        jdbc.update("insert into learning_resources (created_by,source,external_id,title,description,category,resource_type,resource_url,thumbnail_url,provider_name,status) values (?,?,?,?,?,?,?,?,?,?, 'draft')",
                adminId, SOURCE, playlistId, limit(title, 220), description, limit(topic, 120), "course", url, thumbnailUrl, providerName);
        return true;
    }

    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private String thumbnail(JsonNode snippet) {
        JsonNode thumbnails = snippet.path("thumbnails");
        for (String size : List.of("maxres", "high", "medium", "default")) {
            String url = clean(thumbnails.path(size).path("url").asText());
            if (!url.isBlank()) return limit(url, 600);
        }
        return null;
    }
    private String clean(String value) { return value == null ? "" : value.trim(); }
    private String limit(String value, int length) { return value.substring(0, Math.min(value.length(), length)); }

    private record Candidate(JsonNode item, double score) {}
    private record Stats(long views, long likes, long comments) {}
}
