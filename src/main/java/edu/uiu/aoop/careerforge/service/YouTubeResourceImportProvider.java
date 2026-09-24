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
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;

/** Searches YouTube and imports the three strongest matching public playlists as drafts. */
@Service
@Transactional
public class YouTubeResourceImportProvider implements ResourceImportProvider {
    private static final String SOURCE = "YouTube Playlist Search";
    private static final int CANDIDATE_LIMIT = 10;
    private static final int STUDENT_CANDIDATE_LIMIT = 6;
    private static final int STUDENT_RESULT_LIMIT = 5;
    private static final int SAMPLE_VIDEO_LIMIT = 5;
    private static final long STUDENT_SEARCH_CACHE_MILLIS = 6L * 60L * 60L * 1000L;

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String apiKey;
    private final Map<String, CachedStudentSearch> studentSearchCache = new ConcurrentHashMap<>();

    public YouTubeResourceImportProvider(JdbcTemplate jdbc, ObjectMapper mapper,
                                         @Value("${youtube.api-key:}") String apiKey) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
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

    public List<Map<String, Object>> searchPlaylists(String topic) {
        if (topic == null || topic.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a skill to search YouTube.");
        if (apiKey.isBlank()) return fallbackPlaylistSearch(topic.trim());
        try {
            String normalizedTopic = topic.trim().toLowerCase(Locale.ROOT);
            CachedStudentSearch cached = studentSearchCache.get(normalizedTopic);
            if (cached != null && !cached.isExpired()) return cached.results();

            List<Candidate> candidates = rankStudentCandidates(searchStudentCandidates(topic.trim()));
            List<Map<String, Object>> results = new ArrayList<>();
            for (Candidate candidate : candidates.stream().limit(STUDENT_RESULT_LIMIT).toList()) {
                JsonNode item = candidate.item();
                String playlistId = item.path("id").path("playlistId").asText();
                JsonNode snippet = item.path("snippet");
                Map<String, Object> playlist = new LinkedHashMap<>();
                playlist.put("id", playlistId); playlist.put("title", clean(snippet.path("title").asText())); playlist.put("description", clean(snippet.path("description").asText()));
                playlist.put("providerName", clean(snippet.path("channelTitle").asText())); playlist.put("thumbnailUrl", thumbnail(snippet));
                playlist.put("videoCount", candidate.videoCount());
                playlist.put("resourceUrl", "https://www.youtube.com/playlist?list=" + playlistId); results.add(playlist);
            }
            List<Map<String, Object>> immutableResults = List.copyOf(results);
            if (!immutableResults.isEmpty()) {
                studentSearchCache.put(normalizedTopic, new CachedStudentSearch(immutableResults, System.currentTimeMillis()));
            }
            return immutableResults;
        } catch (ResponseStatusException exception) { return fallbackPlaylistSearch(topic.trim()); }
        catch (Exception exception) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "YouTube playlist search could not complete right now."); }
    }

    /**
     * Keeps the student journey usable if YouTube temporarily rejects API calls
     * (for example, while the daily API quota resets). This is deliberately a
     * clearly-labelled handoff to YouTube's live playlist-only search rather
     * than pretending a stale or unranked item is one of our recommendations.
     */
    private List<Map<String, Object>> fallbackPlaylistSearch(String topic) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", "youtube-live-search-" + topic.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-"));
        result.put("title", "See current " + topic + " playlists on YouTube");
        result.put("description", "YouTube's ranking service is temporarily busy. Open its live playlist results to choose a course now.");
        result.put("providerName", "YouTube");
        result.put("fallback", true);
        result.put("resourceUrl", "https://www.youtube.com/results?search_query="
                + encode(topic + " full course tutorial") + "&sp=EgIQAw%3D%3D");
        return List.of(result);
    }

    /** The administrator import keeps its original, established ranking behaviour. */
    private List<Candidate> rankCandidates(JsonNode items) throws Exception {
        List<JsonNode> searchItems = new ArrayList<>();
        for (JsonNode item : items) {
            if (!item.path("id").path("playlistId").asText().isBlank()) searchItems.add(item);
        }
        if (searchItems.isEmpty()) return List.of();

        List<String> playlistIds = searchItems.stream()
                .map(item -> item.path("id").path("playlistId").asText())
                .toList();
        CompletableFuture<Map<String, Integer>> itemCountsFuture = CompletableFuture.supplyAsync(
                () -> fetch(() -> playlistDetails(playlistIds)));
        Map<String, List<String>> sampledVideos = new HashMap<>();
        Set<String> allVideoIds = new HashSet<>();
        List<CompletableFuture<Map.Entry<String, List<String>>>> playlistVideoFutures = playlistIds.stream()
                .map(playlistId -> CompletableFuture.supplyAsync(
                        () -> Map.entry(playlistId, fetch(() -> playlistVideos(playlistId)))))
                .toList();
        for (CompletableFuture<Map.Entry<String, List<String>>> future : playlistVideoFutures) {
            Map.Entry<String, List<String>> sample = future.join();
            sampledVideos.put(sample.getKey(), sample.getValue());
            allVideoIds.addAll(sample.getValue());
        }
        Map<String, Stats> stats = videoStats(new ArrayList<>(allVideoIds));
        Map<String, Integer> itemCounts = itemCountsFuture.join();
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
            ranked.add(new Candidate(item, score, itemCounts.getOrDefault(playlistId, 0)));
        }
        ranked.sort(Comparator.comparingDouble(Candidate::score).reversed());
        return ranked;
    }

    /**
     * A single global, English-first learning search gives the broadest pool of
     * reputable courses. Repeating separate language calls costs 300 quota units
     * per student click and quickly makes the feature unavailable for everyone.
     * A Bangla or Hindi query is used only if the primary search has no match.
     */
    private List<StudentSearchCandidate> searchStudentCandidates(String topic) throws Exception {
        List<StudentSearchCandidate> results = new ArrayList<>();
        Set<String> seenPlaylistIds = new HashSet<>();
        ResponseStatusException lastFailure = null;
        try { addStudentCandidates(results, seenPlaylistIds, searchGlobal(topic), topic, 1d); }
        catch (ResponseStatusException exception) { lastFailure = exception; }
        if (results.isEmpty()) {
            try { addStudentCandidates(results, seenPlaylistIds, searchBangla(topic), topic, .98d); }
            catch (ResponseStatusException exception) { lastFailure = exception; }
        }
        if (results.isEmpty()) {
            try { addStudentCandidates(results, seenPlaylistIds, searchHindi(topic), topic, .96d); }
            catch (ResponseStatusException exception) { lastFailure = exception; }
        }
        if (results.isEmpty() && lastFailure != null) throw lastFailure;
        return results;
    }

    private void addStudentCandidates(List<StudentSearchCandidate> results, Set<String> seenPlaylistIds,
                                      JsonNode items, String topic, double languagePreference) {
        int resultCount = Math.max(items.size(), 1);
        int index = 0;
        for (JsonNode item : items) {
            String playlistId = item.path("id").path("playlistId").asText();
            if (!playlistId.isBlank() && topicMatches(item, topic) && seenPlaylistIds.add(playlistId)) {
                double searchRelevance = (resultCount - index) / (double) resultCount;
                results.add(new StudentSearchCandidate(item, searchRelevance, languagePreference));
            }
            index++;
        }
    }

    private boolean topicMatches(JsonNode item, String topic) {
        String normalizedTopic = topic.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
        if (normalizedTopic.isBlank()) return true;
        String searchable = (clean(item.path("snippet").path("title").asText()) + " "
                + clean(item.path("snippet").path("description").asText()))
                .toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ");
        if (searchable.contains(normalizedTopic)) return true;
        String[] words = normalizedTopic.split("\\s+");
        int matchedWords = 0;
        for (String word : words) if (word.length() > 2 && searchable.contains(word)) matchedWords++;
        return matchedWords >= Math.max(1, words.length - 1);
    }

    /** Ranks only language-appropriate, topic-matching playlists by real audience signals. */
    private List<Candidate> rankStudentCandidates(List<StudentSearchCandidate> studentCandidates) throws Exception {
        List<StudentSearchCandidate> searchItems = studentCandidates.stream()
                .filter(candidate -> !candidate.item().path("id").path("playlistId").asText().isBlank()).toList();
        if (searchItems.isEmpty()) return List.of();

        List<String> playlistIds = searchItems.stream()
                .map(candidate -> candidate.item().path("id").path("playlistId").asText())
                .toList();
        CompletableFuture<Map<String, Integer>> itemCountsFuture = CompletableFuture.supplyAsync(() -> fetch(() -> playlistDetails(playlistIds)));
        Map<String, List<String>> sampledVideos = new HashMap<>();
        Set<String> allVideoIds = new HashSet<>();
        Set<String> channelIds = new HashSet<>();
        for (StudentSearchCandidate candidate : searchItems) {
            String channelId = candidate.item().path("snippet").path("channelId").asText();
            if (!channelId.isBlank()) channelIds.add(channelId);
        }
        CompletableFuture<Map<String, Long>> subscriberCountsFuture = CompletableFuture.supplyAsync(() -> fetch(() -> channelSubscribers(new ArrayList<>(channelIds))));
        List<CompletableFuture<Map.Entry<String, List<String>>>> playlistVideoFutures = playlistIds.stream()
                .map(playlistId -> CompletableFuture.supplyAsync(() -> Map.entry(playlistId, fetch(() -> playlistVideos(playlistId)))))
                .toList();
        for (CompletableFuture<Map.Entry<String, List<String>>> future : playlistVideoFutures) {
            Map.Entry<String, List<String>> sample = future.join();
            sampledVideos.put(sample.getKey(), sample.getValue());
            allVideoIds.addAll(sample.getValue());
        }
        Map<String, Integer> itemCounts = itemCountsFuture.join();
        Map<String, Stats> stats = videoStats(new ArrayList<>(allVideoIds));
        Map<String, Long> subscriberCounts = subscriberCountsFuture.join();

        List<Candidate> ranked = new ArrayList<>();
        for (StudentSearchCandidate studentCandidate : searchItems) {
            JsonNode item = studentCandidate.item();
            String playlistId = item.path("id").path("playlistId").asText();
            List<Stats> videoStats = sampledVideos.getOrDefault(playlistId, List.of()).stream()
                    .map(stats::get).filter(java.util.Objects::nonNull).toList();
            double averageViews = videoStats.stream().mapToLong(Stats::views).average().orElse(0d);
            double averageEngagement = videoStats.stream()
                    .mapToDouble(stat -> (stat.likes() + stat.comments()) / (double) Math.max(stat.views(), 1L))
                    .average().orElse(0d);
            double relevance = studentCandidate.searchRelevance();
            double popularity = Math.min(1d, Math.log10(averageViews + 1d) / 7d);
            double engagement = Math.min(1d, Math.log10(averageEngagement * 10000d + 1d) / 4d);
            double depth = Math.min(1d, Math.log10(itemCounts.getOrDefault(playlistId, 0) + 1d) / 3d);
            long subscribers = subscriberCounts.getOrDefault(item.path("snippet").path("channelId").asText(), 0L);
            double channelAuthority = Math.min(1d, Math.log10(subscribers + 1d) / 7d);
            // Viewership and channel authority outrank raw Search API position.
            // The final small boost keeps English, Bangla and Hindi results ahead
            // of any fallback result without favouring one of those three.
            double score = 0.20d * relevance + 0.28d * popularity + 0.12d * engagement
                    + 0.25d * channelAuthority + 0.10d * depth + 0.05d * studentCandidate.languagePreference();
            ranked.add(new Candidate(item, score, itemCounts.getOrDefault(playlistId, 0)));
        }
        ranked.sort(Comparator.comparingDouble(Candidate::score).reversed());
        return ranked;
    }

    private JsonNode search(String topic) throws Exception {
        String query = "part=snippet&type=playlist&order=relevance&maxResults=" + CANDIDATE_LIMIT
                + "&safeSearch=strict&q=" + encode(topic) + "&regionCode=BD&key=" + encode(apiKey);
        return get("search", "playlist search", query).path("items");
    }


    private JsonNode searchGlobal(String topic) throws Exception {
        String query = "part=snippet&type=playlist&order=relevance&maxResults=" + STUDENT_CANDIDATE_LIMIT
                + "&safeSearch=strict&relevanceLanguage=en&regionCode=US&q=" + encode(topic + " full course tutorial") + "&key=" + encode(apiKey);
        return get("search", "English playlist search", query).path("items");
    }

    private JsonNode searchBangla(String topic) throws Exception {
        String query = "part=snippet&type=playlist&order=relevance&maxResults=" + STUDENT_CANDIDATE_LIMIT
                + "&safeSearch=strict&relevanceLanguage=bn&regionCode=BD&q=" + encode(topic + " Bangla tutorial") + "&key=" + encode(apiKey);
        return get("search", "Bangla playlist search", query).path("items");
    }

    private JsonNode searchHindi(String topic) throws Exception {
        String query = "part=snippet&type=playlist&order=relevance&maxResults=" + STUDENT_CANDIDATE_LIMIT
                + "&safeSearch=strict&relevanceLanguage=hi&regionCode=IN&q=" + encode(topic + " Hindi tutorial") + "&key=" + encode(apiKey);
        return get("search", "Hindi playlist search", query).path("items");
    }

    private Map<String, Integer> playlistDetails(List<String> ids) throws Exception {
        if (ids.isEmpty()) return Map.of();
        String query = "part=contentDetails&id=" + encode(String.join(",", ids)) + "&key=" + encode(apiKey);
        JsonNode items = get("playlists", "playlist details", query).path("items");
        Map<String, Integer> result = new HashMap<>();
        for (JsonNode item : items) result.put(item.path("id").asText(), item.path("contentDetails").path("itemCount").asInt(0));
        return result;
    }

    private Map<String, Long> channelSubscribers(List<String> ids) throws Exception {
        if (ids.isEmpty()) return Map.of();
        String query = "part=statistics&id=" + encode(String.join(",", ids)) + "&key=" + encode(apiKey);
        JsonNode items = get("channels", "channel statistics", query).path("items");
        Map<String, Long> result = new HashMap<>();
        for (JsonNode item : items) {
            result.put(item.path("id").asText(), item.path("statistics").path("subscriberCount").asLong(0));
        }
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
        Map<String, Stats> result = new HashMap<>();
        // The YouTube API accepts at most 50 video IDs per statistics request.
        for (int start = 0; start < ids.size(); start += 50) {
            List<String> batch = ids.subList(start, Math.min(start + 50, ids.size()));
            String query = "part=statistics&id=" + encode(String.join(",", batch)) + "&key=" + encode(apiKey);
            JsonNode items = get("videos", "video statistics", query).path("items");
            for (JsonNode item : items) {
                JsonNode statistics = item.path("statistics");
                result.put(item.path("id").asText(), new Stats(
                        statistics.path("viewCount").asLong(0),
                        statistics.path("likeCount").asLong(0),
                        statistics.path("commentCount").asLong(0)));
            }
        }
        return result;
    }

    private JsonNode get(String endpoint, String operation, String query) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/" + endpoint + "?" + query))
                .timeout(Duration.ofSeconds(15))
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
    private <T> T fetch(CheckedSupplier<T> supplier) {
        try { return supplier.get(); }
        catch (Exception exception) { throw new CompletionException(exception); }
    }
    private String thumbnail(JsonNode snippet) {
        JsonNode thumbnails = snippet.path("thumbnails");
        // The YouTube Search API's "high" image is often 4:3, whereas its
        // "medium" image is the normal 16:9 player thumbnail. Prefer it so
        // resource cards show the complete video artwork without cropping.
        for (String size : List.of("maxres", "medium", "high", "default")) {
            String url = clean(thumbnails.path(size).path("url").asText());
            if (!url.isBlank()) return limit(url, 600);
        }
        return null;
    }
    private String clean(String value) { return value == null ? "" : value.trim(); }
    private String limit(String value, int length) { return value.substring(0, Math.min(value.length(), length)); }

    private record Candidate(JsonNode item, double score, int videoCount) {}
    private record StudentSearchCandidate(JsonNode item, double searchRelevance, double languagePreference) {}
    private record CachedStudentSearch(List<Map<String, Object>> results, long createdAt) {
        private boolean isExpired() { return System.currentTimeMillis() - createdAt >= STUDENT_SEARCH_CACHE_MILLIS; }
    }
    private record Stats(long views, long likes, long comments) {}
    @FunctionalInterface private interface CheckedSupplier<T> { T get() throws Exception; }
}
