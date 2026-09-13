package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LearningPathRequest(@NotBlank @Size(max = 180) String topic, @Pattern(regexp = "skill|job") String pathType, @Min(1) @Max(50) int levelCount) { }
