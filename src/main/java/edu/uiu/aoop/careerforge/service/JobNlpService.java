package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Lightweight, deterministic NLP baseline for imported jobs.
 *
 * This intentionally does not call an LLM. It normalizes a listing and extracts
 * skills from a controlled vocabulary so that later embedding generation can be
 * added without changing the import or recommendation flow.
 */
@Service
public class JobNlpService {
    private static final Set<String> SKILLS = Set.of(
            "java", "python", "javascript", "typescript", "react", "angular", "vue", "node", "spring",
            "sql", "mysql", "postgresql", "mongodb", "html", "css", "kotlin", "swift", "c++", "c#",
            "php", "laravel", "django", "flask", "dotnet", ".net", "aws", "azure", "gcp", "docker",
            "kubernetes", "terraform", "git", "linux", "machine learning", "data science", "excel",
            "power bi", "figma", "selenium", "rest api", "graphql"
    );

    public Analysis analyze(Job job) {
        String title = normalize(job.getTitle());
        String description = normalize(job.getDescription());
        String combined = title + " " + description;
        Set<String> skills = extractSkills(combined);
        String role = normalizeRole(title);

        int signals = 0;
        if (!title.isBlank()) signals += 30;
        if (description.length() >= 80) signals += 30;
        if (!skills.isEmpty()) signals += Math.min(25, skills.size() * 5);
        if (job.getLocation() != null && !job.getLocation().isBlank()) signals += 10;
        if (job.getMinExperienceYears() != null || job.getMaxExperienceYears() != null) signals += 5;
        double confidence = Math.min(100, signals);
        String status = confidence >= 60 ? "processed" : "needs_review";

        job.applyNlp(role, String.join(", ", skills), status, confidence, LocalDateTime.now());
        return new Analysis(role, skills, status, confidence);
    }

    private Set<String> extractSkills(String text) {
        Set<String> found = new LinkedHashSet<>();
        for (String skill : SKILLS) {
            if (containsPhrase(text, skill)) found.add(skill);
        }
        return found;
    }

    private String normalizeRole(String title) {
        if (title.isBlank()) return null;
        String cleaned = title.replaceAll("\\s+", " ").trim();
        if (cleaned.length() > 180) cleaned = cleaned.substring(0, 180).trim();
        return cleaned.toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.toLowerCase(Locale.ROOT)
                .replace("front-end", "frontend")
                .replace("back-end", "backend")
                .replace("spring boot", "spring")
                .replace("node.js", "node")
                .replaceAll("[^a-z0-9+#.]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean containsPhrase(String text, String phrase) {
        String normalizedPhrase = normalize(phrase);
        return Arrays.stream(text.split("\\s+"))
                .collect(Collectors.joining(" "))
                .contains(normalizedPhrase);
    }

    public record Analysis(String normalizedRole, Set<String> extractedSkills, String status, double confidence) { }
}
