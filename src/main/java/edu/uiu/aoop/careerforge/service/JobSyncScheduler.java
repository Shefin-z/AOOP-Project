package edu.uiu.aoop.careerforge.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import edu.uiu.aoop.careerforge.repository.JobRepository;

/** Optional background refresh. Disabled by default so local development never unexpectedly calls providers. */
@Service
public class JobSyncScheduler {
    private static final Logger log = LoggerFactory.getLogger(JobSyncScheduler.class);
    private final List<JobSourceAdapter> sources;
    private final ExecutorService executor;
    private final JobService jobs;
    private final JobSyncTracker tracker;
    private final JobRepository jobRepository;
    private final EmbeddingService embeddings;
    private final boolean enabled;

    public JobSyncScheduler(List<JobSourceAdapter> sources, @Qualifier("jobSyncExecutor") ExecutorService executor,
                            JobService jobs, JobSyncTracker tracker, JobRepository jobRepository,
                            EmbeddingService embeddings,
                            @Value("${careerforge.jobs.sync-enabled:false}") boolean enabled) {
        this.sources = sources; this.executor = executor; this.jobs = jobs; this.tracker = tracker; this.jobRepository = jobRepository; this.embeddings = embeddings; this.enabled = enabled;
    }

    @Scheduled(fixedDelayString = "${careerforge.jobs.sync-interval-ms:21600000}", initialDelayString = "${careerforge.jobs.sync-initial-delay-ms:21600000}")
    public void refresh() {
        if (!enabled) return;
        jobs.closeExpiredJobs();
        sources.stream().filter(source -> !"linkedin".equals(source.sourceKey())).map(source -> CompletableFuture.supplyAsync(() -> {
            tracker.start(source.sourceKey());
            try {
                int imported = source.importJobs();
                tracker.complete(source.sourceKey(), imported, jobRepository);
                int queuedEmbeddings = embeddings.enqueueMissingJobs(
                        jobRepository.findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc("published", java.time.LocalDate.now()), 100);
                log.info("Job source {} refreshed: {} imported", source.sourceKey(), imported);
                log.info("Queued {} missing job embeddings after {} refresh", queuedEmbeddings, source.sourceKey());
                return imported;
            } catch (Exception error) {
                tracker.failed(source.sourceKey(), error.getMessage());
                log.warn("Job source {} refresh failed: {}", source.sourceKey(), error.getMessage());
                return 0;
            }
        }, executor)).toList();
    }
}
