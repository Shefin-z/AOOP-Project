package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.JobEmbedding;
import edu.uiu.aoop.careerforge.model.ProfileEmbedding;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.repository.JobEmbeddingRepository;
import edu.uiu.aoop.careerforge.repository.ProfileEmbeddingRepository;
import edu.uiu.aoop.careerforge.repository.ResumeVersionRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;

/** Queues durable job/profile embeddings and provides cosine similarity for recommendations. */
@Service
public class EmbeddingService {
    private final GeminiEmbeddingClient client;
    private final JobEmbeddingRepository jobEmbeddings;
    private final ProfileEmbeddingRepository profileEmbeddings;
    private final ResumeVersionRepository resumes;
    private final ObjectMapper mapper;
    private final ExecutorService executor;
    private final Set<Long> queuedJobs = ConcurrentHashMap.newKeySet();
    private final Set<Long> queuedProfiles = ConcurrentHashMap.newKeySet();

    public EmbeddingService(GeminiEmbeddingClient client, JobEmbeddingRepository jobEmbeddings,
                            ProfileEmbeddingRepository profileEmbeddings, ObjectMapper mapper,
                            ResumeVersionRepository resumes,
                            @Qualifier("embeddingExecutor") ExecutorService executor) {
        this.client = client; this.jobEmbeddings = jobEmbeddings; this.profileEmbeddings = profileEmbeddings;
        this.resumes = resumes; this.mapper = mapper; this.executor = executor;
    }

    public void enqueueJob(Job job) {
        if (!client.configured() || job == null || job.getId() == null || !queuedJobs.add(job.getId())) return;
        Long id = job.getId(); String title = job.getTitle(); String text = jobText(job);
        executor.submit(() -> { try { processJob(id, title, text); } finally { queuedJobs.remove(id); } });
    }

    public String model() { return client.model(); }
    public boolean configured() { return client.configured(); }

    public void enqueueProfile(StudentProfile profile) {
        if (!client.configured() || profile == null || profile.getUserId() == null || !queuedProfiles.add(profile.getUserId())) return;
        Long id = profile.getUserId(); String text = profileText(profile);
        executor.submit(() -> { try { processProfile(id, text); } finally { queuedProfiles.remove(id); } });
    }

    public int enqueueMissingJobs(Collection<Job> jobs, int limit) {
        int queued = 0;
        for (Job job : jobs) {
            if (queued >= limit || job == null || job.getId() == null) continue;
            JobEmbedding existing = jobEmbeddings.findById(job.getId()).orElse(null);
            if (existing != null && ("processing".equals(existing.getStatus())
                    || ("ready".equals(existing.getStatus()) && client.model().equals(existing.getModel())))) continue;
            enqueueJob(job); queued++;
        }
        return queued;
    }

    public Map<Long, Double> similarity(Long userId, Collection<Long> jobIds) {
        if (userId == null || jobIds == null || jobIds.isEmpty()) return Collections.emptyMap();
        ProfileEmbedding profile = profileEmbeddings.findById(userId).orElse(null);
        if (profile == null || !"ready".equals(profile.getStatus()) || !client.model().equals(profile.getModel())) return Collections.emptyMap();
        List<Double> profileVector = parse(profile.getVectorJson());
        if (profileVector.isEmpty()) return Collections.emptyMap();
        Map<Long, Double> result = new HashMap<>();
        for (JobEmbedding job : jobEmbeddings.findByJobIdIn(jobIds)) {
            if (!"ready".equals(job.getStatus()) || !client.model().equals(job.getModel())) continue;
            List<Double> vector = parse(job.getVectorJson());
            if (vector.size() != profileVector.size()) continue;
            result.put(job.getJobId(), Math.max(0, cosine(profileVector, vector)) * 100.0);
        }
        return result;
    }

    public Map<String, Long> statusCounts() {
        return Map.of("ready", jobEmbeddings.countByStatus("ready"), "processing", jobEmbeddings.countByStatus("processing"), "failed", jobEmbeddings.countByStatus("failed"));
    }

    private void processJob(Long id, String title, String text) {
        String hash = hash(title + "\n" + text);
        JobEmbedding entity = jobEmbeddings.findById(id).orElseGet(() -> new JobEmbedding(id));
        if ("ready".equals(entity.getStatus()) && hash.equals(entity.getContentHash()) && client.model().equals(entity.getModel())) return;
        entity.markProcessing(client.model(), client.dimensions(), hash); jobEmbeddings.save(entity);
        try {
            List<Double> vector = client.embedDocument(title, text);
            entity.markReady(client.model(), vector.size(), mapper.writeValueAsString(vector), hash); jobEmbeddings.save(entity);
        } catch (Exception exception) { entity.markFailed(client.model(), hash, exception.getMessage()); jobEmbeddings.save(entity); }
    }

    private void processProfile(Long id, String text) {
        String hash = hash(text);
        ProfileEmbedding entity = profileEmbeddings.findById(id).orElseGet(() -> new ProfileEmbedding(id));
        if ("ready".equals(entity.getStatus()) && hash.equals(entity.getContentHash()) && client.model().equals(entity.getModel())) return;
        entity.markProcessing(client.model(), client.dimensions(), hash); profileEmbeddings.save(entity);
        try {
            List<Double> vector = client.embedQuery(text);
            entity.markReady(client.model(), vector.size(), mapper.writeValueAsString(vector), hash); profileEmbeddings.save(entity);
        } catch (Exception exception) { entity.markFailed(client.model(), hash, exception.getMessage()); profileEmbeddings.save(entity); }
    }

    private String jobText(Job job) { return String.join(" | ", safe(job.getDescription()), safe(job.getLocation()), safe(job.getEmploymentType()), safe(job.getWorkMode()), safe(job.getExtractedSkills())); }
    private String profileText(StudentProfile profile) { String cv = resumes.findByUserIdOrderByUpdatedAtDesc(profile.getUserId()).stream().filter(item -> item.isDefault()).findFirst().map(item -> item.getContent()).orElse(""); return String.join(" | ", safe(profile.getTargetRole()), safe(profile.getSkills()), safe(profile.getHobbies()), safe(profile.getBio()), safe(profile.getDegree()), safe(profile.getUniversity()), safe(profile.getLocation()), profile.getExperienceYears() == null ? "" : profile.getExperienceYears() + " years experience", safe(cv)); }
    private List<Double> parse(String value) { try { return mapper.readValue(value, new TypeReference<>() { }); } catch (Exception ignored) { return List.of(); } }
    private double cosine(List<Double> a, List<Double> b) { double dot = 0, an = 0, bn = 0; for (int i = 0; i < a.size(); i++) { double x = a.get(i), y = b.get(i); dot += x * y; an += x * x; bn += y * y; } return an == 0 || bn == 0 ? 0 : dot / (Math.sqrt(an) * Math.sqrt(bn)); }
    private String hash(String value) { try { byte[] bytes = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); StringBuilder out = new StringBuilder(); for (byte item : bytes) out.append(String.format("%02x", item)); return out.toString(); } catch (Exception exception) { throw new IllegalStateException(exception); } }
    private String safe(String value) { return value == null ? "" : value.replaceAll("\\s+", " ").trim(); }
}
