package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.JobDiscoveryResponse;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;
import edu.uiu.aoop.careerforge.repository.ResumeVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class JobDiscoveryService {
    private final JobRepository jobs;
    private final StudentProfileRepository profiles;
    private final ResumeVersionRepository resumes;
    private final AccessService access;
    private final JobService jobService;
    private final JobMatchCalculator calculator;
    private final EmbeddingService embeddings;

    public JobDiscoveryService(JobRepository jobs, StudentProfileRepository profiles, ResumeVersionRepository resumes, AccessService access,
                               JobService jobService, JobMatchCalculator calculator, EmbeddingService embeddings) {
        this.jobs = jobs; this.profiles = profiles; this.resumes = resumes; this.access = access; this.jobService = jobService; this.calculator = calculator; this.embeddings = embeddings;
    }

    public List<JobDiscoveryResponse> discover(Long userId, String query, String location, String skills, String workMode, String employmentType) {
        access.requireStudent(userId);
        boolean searching = hasText(query) || hasText(location) || hasText(skills) || hasText(workMode) || hasText(employmentType);

        // Manual searches are catalogue lookups. Profile and CV data must not influence
        // either the returned jobs or their ordering.
        if (searching) {
            return jobs.findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc("published", LocalDate.now()).stream()
                    .filter(job -> filters(job, query, location, skills, workMode, employmentType))
                    .map(this::searchResponse)
                    .sorted(Comparator.comparingInt((JobDiscoveryResponse result) -> searchRelevance(result.job(), query)).reversed()
                            .thenComparing(result -> result.job().id(), Comparator.reverseOrder()))
                    .toList();
        }

        StudentProfile profile = profiles.findById(userId).orElse(null);
        String cvSnapshot = resumes.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .filter(item -> item.isDefault()).findFirst().map(item -> item.getContent()).orElse(null);
        if (profile != null) embeddings.enqueueProfile(profile);
        List<JobDiscoveryResponse> results = jobs.findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc("published", LocalDate.now()).stream()
                .filter(job -> compatible(job, profile, cvSnapshot))
                .map(job -> toResponse(job, profile, cvSnapshot))
                .sorted(Comparator.comparingInt((JobDiscoveryResponse result) -> searchRelevance(result.job(), query)).reversed()
                        .thenComparing(JobDiscoveryResponse::matchPercentage, Comparator.reverseOrder())
                        .thenComparing(result -> result.job().id(), Comparator.reverseOrder()))
                .toList();
        List<Long> resultIds = results.stream().map(result -> result.job().id()).toList();
        embeddings.enqueueMissingJobs(jobs.findAllById(resultIds), Math.min(20, resultIds.size()));
        Map<Long, Double> semantic = embeddings.similarity(userId, resultIds);
        if (semantic.isEmpty()) return results;
        return results.stream().map(result -> {
                    Double semanticScore = semantic.get(result.job().id());
                    if (semanticScore == null) return result;
                    double hybrid = (result.matchPercentage().doubleValue() * 0.4) + (semanticScore * 0.6);
                    String summary = "Smart match. " + result.matchSummary() + " Similarity with your profile: " + Math.round(semanticScore) + "/100.";
                    return new JobDiscoveryResponse(result.job(), BigDecimal.valueOf(hybrid).setScale(2, java.math.RoundingMode.HALF_UP), result.matchedSkills(), summary, result.scoreBreakdown());
                })
                .sorted(Comparator.comparing(JobDiscoveryResponse::matchPercentage, Comparator.reverseOrder())
                        .thenComparing(result -> result.job().id(), Comparator.reverseOrder()))
                .toList();
    }

    private int searchRelevance(JobResponse job, String query) {
        if (!hasText(query)) return 0;
        String needle = query.trim().toLowerCase(Locale.ROOT);
        String title = safe(job.title()).toLowerCase(Locale.ROOT);
        String company = safe(job.companyName()).toLowerCase(Locale.ROOT);
        String location = safe(job.location()).toLowerCase(Locale.ROOT);
        String description = safe(job.description()).toLowerCase(Locale.ROOT);
        if (title.equals(needle)) return 100;
        if (title.startsWith(needle)) return 95;
        if (title.contains(needle)) return 90;
        if (company.contains(needle)) return 75;
        if (location.contains(needle)) return 60;
        return description.contains(needle) ? 20 : 0;
    }

    private boolean compatible(Job job, StudentProfile profile, String cvSnapshot) {
        JobMatchCalculator.Result result = calculator.calculate(job, profile, cvSnapshot);
        return result.roleCompatible() && result.experienceCompatible();
    }

    private JobDiscoveryResponse toResponse(Job job, StudentProfile profile, String cvSnapshot) {
        JobMatchCalculator.Result result = calculator.calculate(job, profile, cvSnapshot);
        JobDiscoveryResponse.ScoreBreakdown breakdown = new JobDiscoveryResponse.ScoreBreakdown(
                result.breakdown().role(), result.breakdown().experience(), result.breakdown().skills(),
                result.breakdown().location(), result.breakdown().freshness());
        String summary = result.reasons().isEmpty()
                ? "Complete your profile to improve this match."
                : String.join(" ", result.reasons()) + " Match score: " + result.score() + "/100.";
        JobResponse response = jobService.toResponse(job);
        return new JobDiscoveryResponse(response, BigDecimal.valueOf(result.score()), result.matchedSkills(), summary, breakdown);
    }

    private JobDiscoveryResponse searchResponse(Job job) {
        return new JobDiscoveryResponse(jobService.toResponse(job), null, List.of(), null, null);
    }

    private boolean filters(Job job, String query, String location, String skills, String workMode, String employmentType) {
        String searchable = String.join(" ", safe(job.getTitle()), safe(job.getDescription()), safe(job.getLocation()),
                job.getCompany() == null ? "" : safe(job.getCompany().getName())).toLowerCase(Locale.ROOT);
        if (hasText(query) && !searchable.contains(query.trim().toLowerCase(Locale.ROOT))) return false;
        if (hasText(location) && !safe(job.getLocation()).toLowerCase(Locale.ROOT).contains(location.trim().toLowerCase(Locale.ROOT))) return false;
        if (hasText(skills) && overlap(calculator.terms(skills), calculator.terms(job.getTitle() + " " + job.getDescription())).isEmpty()) return false;
        if (hasText(workMode) && !workMode.equalsIgnoreCase(job.getWorkMode())) return false;
        return !hasText(employmentType) || employmentType.equalsIgnoreCase(job.getEmploymentType());
    }

    private Set<String> overlap(Set<String> first, Set<String> second) {
        return first.stream().filter(second::contains).limit(5).collect(Collectors.toSet());
    }
    private boolean hasText(String value) { return value != null && !value.isBlank(); }
    private String safe(String value) { return value == null ? "" : value; }
}
