package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LearningRecommendationRequest(@NotBlank @Size(max = 180) String topic, @Pattern(regexp = "skill|job") String pathType) { }
