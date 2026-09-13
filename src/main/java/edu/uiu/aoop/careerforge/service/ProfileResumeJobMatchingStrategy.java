package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileResumeJobMatchingStrategy implements JobMatchingStrategy {
    @Override
    public JobMatch match(Job job, StudentProfile profile, String cvSnapshot) {
        Set<String> jobWords = words(job.getTitle() + " " + job.getDescription());
        int score = 0;
        List<String> reasons = new ArrayList<>();

        if (profile != null && profile.getTargetRole() != null) {
            Set<String> shared = overlap(words(profile.getTargetRole()), jobWords);
            if (!shared.isEmpty()) {
                score += 40;
                reasons.add("Your target role matches job keywords: " + String.join(", ", shared) + ".");
            } else reasons.add("Add a target role closer to this opportunity to improve the match.");
        } else reasons.add("Add a target role in your profile to improve the match.");

        Set<String> cvMatches = overlap(words(cvSnapshot), jobWords);
        if (!cvMatches.isEmpty()) {
            score += Math.min(35, cvMatches.size() * 7);
            reasons.add("Your selected CV mentions relevant terms: " + String.join(", ", cvMatches) + ".");
        } else reasons.add("Tailor the selected CV with skills and projects relevant to this job.");

        if (profile != null && profile.getLocation() != null && job.getLocation() != null
                && job.getLocation().toLowerCase(Locale.ROOT).contains(profile.getLocation().toLowerCase(Locale.ROOT))) {
            score += 15;
            reasons.add("Your profile location matches the job location.");
        } else if ("remote".equals(job.getWorkMode())) {
            score += 15;
            reasons.add("This role supports remote work.");
        }

        if (profile != null && profile.getUniversity() != null && profile.getDegree() != null) {
            score += 10;
            reasons.add("Your education profile is complete.");
        }
        return new JobMatch(BigDecimal.valueOf(Math.min(score, 100)), reasons);
    }

    private Set<String> words(String text) {
        if (text == null) return Set.of();
        return Arrays.stream(text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9+#]", " ").split("\\s+"))
                .filter(word -> word.length() >= 3 && !Set.of("with", "from", "your", "that", "this", "the", "and", "for", "are", "job", "role", "work").contains(word))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
    private Set<String> overlap(Set<String> first, Set<String> second) {
        return first.stream().filter(second::contains).limit(5).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
