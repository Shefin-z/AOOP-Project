package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory operational status for the admin sync indicator. */
@Service
public class JobSyncTracker {
    private final Map<String, SyncSnapshot> snapshots = new ConcurrentHashMap<>();

    public void start(String source) {
        snapshots.put(source.toLowerCase(), new SyncSnapshot(source, "running", LocalDateTime.now(), null, 0, 0, 0, 0, null));
    }

    public void complete(String source, int imported, JobRepository jobs) {
        String key = source.toLowerCase();
        snapshots.compute(key, (ignored, previous) -> new SyncSnapshot(source, "success", previous == null ? LocalDateTime.now() : previous.startedAt(),
                LocalDateTime.now(), imported, jobs.countBySourceIgnoreCase(source), jobs.countBySourceIgnoreCaseAndStatus(source, "published"),
                jobs.countBySourceIgnoreCaseAndValidationStatus(source, "needs_review"), null));
    }

    public void failed(String source, String message) {
        String key = source.toLowerCase();
        snapshots.compute(key, (ignored, previous) -> new SyncSnapshot(source, "failed", previous == null ? LocalDateTime.now() : previous.startedAt(),
                LocalDateTime.now(), 0, 0, 0, 0, message));
    }

    public Map<String, Object> snapshot(String source) {
        SyncSnapshot value = snapshots.get(source.toLowerCase());
        if (value == null) return Map.of("source", source, "status", "never_run");
        return Map.of("source", value.source(), "status", value.status(), "startedAt", value.startedAt(), "finishedAt", value.finishedAt() == null ? "" : value.finishedAt(),
                "newJobs", value.newJobs(), "totalJobs", value.totalJobs(), "publishedJobs", value.publishedJobs(), "needsReviewJobs", value.needsReviewJobs(),
                "error", value.error() == null ? "" : value.error());
    }

    private record SyncSnapshot(String source, String status, LocalDateTime startedAt, LocalDateTime finishedAt,
                                int newJobs, long totalJobs, long publishedJobs, long needsReviewJobs, String error) { }
}
