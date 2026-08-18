package edu.uiu.aoop.careerforge.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class WeightedJobMatchingStrategyTest {
  private final WeightedJobMatchingStrategy strategy = new WeightedJobMatchingStrategy();

  @Test
  void explains_the_signals_that_improve_a_match() {
    StudentProfile profile = new StudentProfile();
    profile.update("UIU", "CSE", 2027, "Software Engineer", "Dhaka", null, null, "[\"Java\"]", null);
    Job job = Mockito.mock(Job.class);
    when(job.getTitle()).thenReturn("Software Engineer Intern");
    when(job.getLocation()).thenReturn("Dhaka");
    when(job.getWorkplaceType()).thenReturn("Hybrid");

    var result = strategy.score(profile, job, List.of("Java", "Spring Boot"));

    assertThat(result.percentage()).isBetween(1, 100);
    assertThat(result.reasons()).anyMatch(reason -> reason.contains("target role"));
    assertThat(result.reasons()).anyMatch(reason -> reason.contains("skills"));
  }
}
