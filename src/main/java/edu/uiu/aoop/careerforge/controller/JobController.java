package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.JobRequest;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.dto.JobDiscoveryResponse;
import edu.uiu.aoop.careerforge.service.JobDiscoveryService;
import edu.uiu.aoop.careerforge.service.JobService;
import edu.uiu.aoop.careerforge.service.JobSourceAdapter;
import edu.uiu.aoop.careerforge.service.AccessService;
import edu.uiu.aoop.careerforge.service.JobSyncTracker;
import edu.uiu.aoop.careerforge.service.EmbeddingService;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
public class JobController {
    private final JobService jobs; private final List<JobSourceAdapter> sources; private final JobDiscoveryService discovery; private final AccessService access; private final JobSyncTracker syncTracker; private final JobRepository jobRepository; private final EmbeddingService embeddings;
    @Value("${careerforge.jobs.sync-enabled:false}") private boolean syncEnabled;
    @Value("${careerforge.jobs.sync-interval-ms:21600000}") private long syncIntervalMs;
    @Value("${careerforge.jobs.sync-initial-delay-ms:21600000}") private long syncInitialDelayMs;
    public JobController(JobService jobs, List<JobSourceAdapter> sources, JobDiscoveryService discovery, AccessService access, JobSyncTracker syncTracker, JobRepository jobRepository, EmbeddingService embeddings) { this.jobs = jobs; this.sources = sources; this.discovery = discovery; this.access = access; this.syncTracker = syncTracker; this.jobRepository = jobRepository; this.embeddings = embeddings; }
    @GetMapping("/jobs") public List<JobResponse> list() { jobs.closeExpiredJobs(); return jobs.listPublished(); }
    @GetMapping("/jobs/matches") public List<JobDiscoveryResponse> matches(
            @RequestHeader(name = "X-User-Id", required = false) Long id,
            @RequestParam(required = false) String query, @RequestParam(required = false) String location,
            @RequestParam(required = false) String skills, @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String employmentType) {
        return discovery.discover(id, query, location, skills, workMode, employmentType);
    }
    @GetMapping("/admin/jobs") public List<JobResponse> adminList(@RequestHeader(name = "X-User-Id", required = false) Long id) { return jobs.listForAdmin(id); }
    @PostMapping("/admin/jobs") @ResponseStatus(HttpStatus.CREATED) public JobResponse create(@RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.create(id, request); }
    @PutMapping("/admin/jobs/{jobId}") public JobResponse update(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.update(jobId, id, request); }
    @DeleteMapping("/admin/jobs/{jobId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id) { jobs.delete(jobId, id); }
    @GetMapping("/admin/jobs/sources")
    public List<Map<String, String>> sourceList(@RequestHeader(name = "X-User-Id", required = false) Long id) {
        requireAdmin(id);
        return sources.stream().map(source -> Map.of("key", source.sourceKey(), "name", source.displayName())).toList();
    }
    @PostMapping("/admin/jobs/import")
    public Map<String, Object> importJobs(@RequestHeader(name = "X-User-Id", required = false) Long id) {
        return sync(id, "remotive");
    }
    @PostMapping("/admin/jobs/sync")
    public Map<String, Object> syncJobs(@RequestHeader(name = "X-User-Id", required = false) Long id,
                                        @RequestParam(defaultValue = "all") String source) {
        return sync(id, source);
    }
    @GetMapping("/admin/jobs/sync/status")
    public Map<String, Object> syncStatus(@RequestHeader(name = "X-User-Id", required = false) Long id,
                                          @RequestParam(defaultValue = "bdjobs") String source) {
        requireAdmin(id);
        Map<String, Object> result = new java.util.LinkedHashMap<>(syncTracker.snapshot(source));
        result.put("schedulerEnabled", syncEnabled);
        result.put("intervalMs", syncIntervalMs);
        result.put("initialDelayMs", syncInitialDelayMs);
        return result;
    }
    @GetMapping("/admin/jobs/embeddings/status")
    public Map<String, Object> embeddingStatus(@RequestHeader(name = "X-User-Id", required = false) Long id) {
        requireAdmin(id);
        Map<String, Object> result = new java.util.LinkedHashMap<>(embeddings.statusCounts());
        result.put("model", embeddings.model());
        result.put("configured", embeddings.configured());
        return result;
    }
    @PostMapping("/admin/jobs/embeddings/rebuild")
    public Map<String, Object> rebuildEmbeddings(@RequestHeader(name = "X-User-Id", required = false) Long id,
                                                  @RequestParam(defaultValue = "20") int limit) {
        requireAdmin(id);
        int safeLimit = Math.max(1, Math.min(100, limit));
        int queued = embeddings.enqueueMissingJobs(jobRepository.findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc("published", LocalDate.now()), safeLimit);
        return Map.of("queued", queued, "limit", safeLimit, "status", "queued");
    }
    private Map<String, Object> sync(Long id, String requestedSource) {
        requireAdmin(id);
        if ("all".equalsIgnoreCase(requestedSource)) {
            int imported = sources.stream().filter(source -> !"linkedin".equals(source.sourceKey())
                    ).mapToInt(source -> syncOne(id, source)).sum();
            return Map.of("imported", imported, "source", "all");
        }
        JobSourceAdapter source = sources.stream().filter(item -> item.sourceKey().equalsIgnoreCase(requestedSource)).findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown job source: " + requestedSource));
        int imported = syncOne(id, source);
        Map<String, Object> result = new java.util.LinkedHashMap<>(syncTracker.snapshot(source.sourceKey()));
        result.put("imported", imported);
        return result;
    }
    private int syncOne(Long adminId, JobSourceAdapter source) {
        if ("running".equals(syncTracker.snapshot(source.sourceKey()).get("status"))) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT,
                    source.displayName() + " sync is already running. Please wait for it to finish.");
        }
        syncTracker.start(source.sourceKey());
        try {
            jobs.closeExpiredJobs();
            int imported = jobs.importFromProvider(adminId, source);
            syncTracker.complete(source.sourceKey(), imported, jobRepository);
            embeddings.enqueueMissingJobs(jobRepository.findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc("published", LocalDate.now()), 100);
            return imported;
        } catch (RuntimeException error) {
            syncTracker.failed(source.sourceKey(), error.getMessage());
            throw error;
        }
    }
    private void requireAdmin(Long id) { access.requireAdmin(id); }
}
