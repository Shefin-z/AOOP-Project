package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.JobDiscoveryResponse;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class JobDiscoveryService {
    private final JobRepository jobs;
    private final StudentProfileRepository profiles;
    private final AccessService access;
    private final JobService jobService;

    public JobDiscoveryService(JobRepository jobs, StudentProfileRepository profiles, AccessService access, JobService jobService) {
        this.jobs = jobs; this.profiles = profiles; this.access = access; this.jobService = jobService;
    }

    public List<JobDiscoveryResponse> discover(Long userId, String query, String location, String skills, String workMode, String employmentType) {
        access.requireStudent(userId);
        StudentProfile profile = profiles.findById(userId).orElse(null);
        Set<String> profileSkills = terms(profile == null ? null : profile.getSkills());
        boolean searching = hasText(query) || hasText(location) || hasText(skills) || hasText(workMode) || hasText(employmentType);
        return jobs.findByStatusAndExpiryDateGreaterThanEqualOrderByCreatedAtDescIdDesc("published", LocalDate.now()).stream()
                .filter(job -> filters(job, query, location, skills, workMode, employmentType))
                .map(job -> score(job, profile, profileSkills))
                .filter(result -> searching || profileSkills.isEmpty() || result.matchPercentage().signum() > 0)
                .sorted(Comparator.comparing(JobDiscoveryResponse::matchPercentage).reversed().thenComparing(result -> result.job().id(), Comparator.reverseOrder()))
                .toList();
    }

    private JobDiscoveryResponse score(Job job, StudentProfile profile, Set<String> profileSkills) {
        Set<String> jobTerms = terms(job.getTitle() + " " + job.getDescription());
        Set<String> sharedSkills = overlap(profileSkills, jobTerms);
        int score = Math.min(70, sharedSkills.size() * 20);
        Set<String> targetOverlap = overlap(terms(profile == null ? null : profile.getTargetRole()), jobTerms);
        score += Math.min(20, targetOverlap.size() * 7);
        if (profile != null && hasText(profile.getLocation()) && hasText(job.getLocation()) && job.getLocation().toLowerCase(Locale.ROOT).contains(profile.getLocation().toLowerCase(Locale.ROOT))) score += 10;
        else if ("remote".equals(job.getWorkMode())) score += 5;
        String summary = !sharedSkills.isEmpty() ? "Matches your saved skills: " + String.join(", ", sharedSkills) + "." : targetOverlap.isEmpty() ? "Add relevant skills to improve your matches." : "Matches your target role: " + String.join(", ", targetOverlap) + ".";
        JobResponse response = jobService.toResponse(job);
        return new JobDiscoveryResponse(response, BigDecimal.valueOf(Math.min(100, score)), List.copyOf(sharedSkills), summary);
    }

    private boolean filters(Job job, String query, String location, String skills, String workMode, String employmentType) {
        String searchable = String.join(" ", safe(job.getTitle()), safe(job.getDescription()), safe(job.getLocation()), safe(job.getCompany().getName())).toLowerCase(Locale.ROOT);
        if (hasText(query) && !searchable.contains(query.trim().toLowerCase(Locale.ROOT))) return false;
        if (hasText(location) && !safe(job.getLocation()).toLowerCase(Locale.ROOT).contains(location.trim().toLowerCase(Locale.ROOT))) return false;
        if (hasText(skills) && overlap(terms(skills), terms(job.getTitle() + " " + job.getDescription())).isEmpty()) return false;
        if (hasText(workMode) && !workMode.equalsIgnoreCase(job.getWorkMode())) return false;
        return !hasText(employmentType) || employmentType.equalsIgnoreCase(job.getEmploymentType());
    }

    private Set<String> terms(String value) {
        if (!hasText(value)) return Set.of();
        return Arrays.stream(value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9+#]", " ").split("\\s+"))
                .filter(term -> term.length() >= 2 && !Set.of("with", "from", "your", "that", "this", "the", "and", "for", "are", "job", "role", "work", "developer").contains(term))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
    private Set<String> overlap(Set<String> first, Set<String> second) { return first.stream().filter(second::contains).limit(5).collect(Collectors.toCollection(LinkedHashSet::new)); }
    private boolean hasText(String value) { return value != null && !value.isBlank(); }
    private String safe(String value) { return value == null ? "" : value; }
}
