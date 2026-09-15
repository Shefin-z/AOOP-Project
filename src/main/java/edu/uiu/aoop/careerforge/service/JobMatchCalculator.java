package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** One scoring model shared by recommendations and CV/job matching. */
@Service
public class JobMatchCalculator {
    private static final Set<String> STOP_WORDS = Set.of("with", "from", "your", "that", "this", "the", "and", "for", "are", "job", "role", "work", "looking", "company", "years", "year");
    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("js", "javascript"), Map.entry("javascript", "javascript"),
            Map.entry("ts", "typescript"), Map.entry("typescript", "typescript"),
            Map.entry("reactjs", "react"), Map.entry("react", "react"),
            Map.entry("nodejs", "node"), Map.entry("node", "node"),
            Map.entry("springboot", "spring"), Map.entry("spring", "spring"),
            Map.entry("front-end", "frontend"), Map.entry("frontend", "frontend"),
            Map.entry("back-end", "backend"), Map.entry("backend", "backend"),
            Map.entry("qa", "qualityassurance"), Map.entry("qualityassurance", "qualityassurance"),
            Map.entry("devops", "devops"), Map.entry("sre", "devops")
    );

    public Result calculate(Job job, StudentProfile profile, String cvSnapshot) {
        String jobText = text(job.getTitle()) + " " + text(job.getDescription());
        Set<String> jobTerms = terms(jobText);
        Set<String> roleTerms = profile == null ? Set.of() : roleTerms(profile.getTargetRole());
        Set<String> roleMatches = overlap(roleTerms, jobTerms);
        boolean roleCompatible = !hasText(profile == null ? null : profile.getTargetRole()) || !roleMatches.isEmpty();

        int role = !hasText(profile == null ? null : profile.getTargetRole()) ? 18 : roleMatches.isEmpty() ? 0 : 40;
        int experience = experienceScore(job, profile);
        boolean experienceCompatible = experience >= 0;
        if (!experienceCompatible) experience = 0;
        Set<String> profileSkills = terms(profile == null ? null : profile.getSkills());
        Set<String> interests = terms(profile == null ? null : profile.getHobbies());
        Set<String> cvSkills = terms(cvSnapshot);
        Set<String> matchedSkills = overlap(profileSkills, jobTerms);
        matchedSkills.addAll(overlap(interests, jobTerms));
        matchedSkills.addAll(overlap(cvSkills, jobTerms));
        int skills = profileSkills.isEmpty() && cvSkills.isEmpty() ? 10 : Math.min(20, matchedSkills.size() * 5);
        int location = locationScore(job, profile);
        int freshness = freshnessScore(job);
        int total = Math.min(100, role + experience + skills + location + freshness);

        List<String> reasons = new ArrayList<>();
        if (role > 0 && hasText(profile == null ? null : profile.getTargetRole())) reasons.add("Target role aligns with this listing.");
        else if (hasText(profile == null ? null : profile.getTargetRole())) reasons.add("Target role does not align closely with this listing.");
        if (experienceCompatible && profile != null && profile.getExperienceYears() != null && (job.getMinExperienceYears() != null || job.getMaxExperienceYears() != null)) reasons.add("Experience requirement fits your profile.");
        if (!matchedSkills.isEmpty()) reasons.add("Relevant skills: " + String.join(", ", matchedSkills) + ".");
        if (location == 10) reasons.add("Location matches your profile.");
        else if (location >= 8) reasons.add("This role supports remote work.");
        if (freshness >= 4) reasons.add("Recently verified listing.");
        return new Result(total, List.copyOf(matchedSkills), roleCompatible, experienceCompatible, new ScoreBreakdown(role, experience, skills, location, freshness), reasons);
    }

    public Set<String> terms(String value) {
        if (!hasText(value)) return new LinkedHashSet<>();
        String normalized = value.toLowerCase(Locale.ROOT).replace("front end", "frontend").replace("back end", "backend").replace("quality assurance", "qualityassurance").replace("spring boot", "springboot");
        return Arrays.stream(normalized.replaceAll("[^a-z0-9+#-]", " ").split("\\s+"))
                .filter(term -> term.length() >= 2 && !STOP_WORDS.contains(term))
                .map(term -> ALIASES.getOrDefault(term, term))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> roleTerms(String value) {
        Set<String> result = terms(value);
        String normalized = text(value).toLowerCase(Locale.ROOT);
        if (normalized.contains("software") || normalized.contains("developer") || normalized.contains("engineer")) result.add("engineer");
        if (normalized.contains("frontend") || normalized.contains("front-end") || normalized.contains("front end")) result.add("frontend");
        if (normalized.contains("backend") || normalized.contains("back-end") || normalized.contains("back end")) result.add("backend");
        if (normalized.contains("data scientist")) result.add("datascientist");
        if (normalized.contains("data analyst")) result.add("dataanalyst");
        return result;
    }

    private int experienceScore(Job job, StudentProfile profile) {
        Integer years = profile == null ? null : profile.getExperienceYears();
        Integer min = job.getMinExperienceYears(), max = job.getMaxExperienceYears();
        if (years == null || (min == null && max == null)) return 12;
        if (min != null && years < min) return -1;
        if (max != null && years > max) return -1;
        return 25;
    }

    private int locationScore(Job job, StudentProfile profile) {
        String wanted = profile == null ? null : profile.getLocation();
        String actual = job.getLocation();
        if (hasText(wanted) && hasText(actual) && actual.toLowerCase(Locale.ROOT).contains(wanted.toLowerCase(Locale.ROOT))) return 10;
        if ("remote".equalsIgnoreCase(job.getWorkMode()) || text(actual).toLowerCase(Locale.ROOT).contains("remote")) return 8;
        return hasText(wanted) && hasText(actual) ? 0 : 5;
    }

    private int freshnessScore(Job job) {
        LocalDateTime verified = job.getLastVerifiedAt() != null ? job.getLastVerifiedAt() : job.getCreatedAt();
        if (verified == null) return 2;
        long days = Math.max(0, ChronoUnit.DAYS.between(verified, LocalDateTime.now()));
        return days <= 7 ? 5 : days <= 30 ? 3 : 1;
    }

    private Set<String> overlap(Set<String> first, Set<String> second) {
        return first.stream().filter(second::contains).limit(8).collect(Collectors.toCollection(LinkedHashSet::new));
    }
    private boolean hasText(String value) { return value != null && !value.isBlank(); }
    private String text(String value) { return value == null ? "" : value; }

    public record ScoreBreakdown(int role, int experience, int skills, int location, int freshness) { }
    public record Result(int score, List<String> matchedSkills, boolean roleCompatible, boolean experienceCompatible,
                         ScoreBreakdown breakdown, List<String> reasons) { }
}
