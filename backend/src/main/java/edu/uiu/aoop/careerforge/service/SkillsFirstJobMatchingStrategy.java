package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import java.util.List;

/**
 * An alternative Strategy implementation that prioritizes a student's saved skills.
 * It is not registered as a Spring bean yet, so the existing weighted strategy remains active.
 */
public class SkillsFirstJobMatchingStrategy implements JobMatchingStrategy {

  @Override
  public MatchResult score(StudentProfile profile, Job job, List<String> skills) {
    if (profile == null || skills.isEmpty()) {
      return new MatchResult(0, List.of(), List.of(), List.of("Add skills to receive a skills-first match"));
    }

    int percentage = Math.min(100, skills.size() * 20);
    return new MatchResult(
        percentage,
        List.copyOf(skills),
        List.of(),
        List.of("This match is based primarily on your saved skills"));
  }
}
