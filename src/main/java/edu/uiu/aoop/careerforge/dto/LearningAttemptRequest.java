package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record LearningAttemptRequest(@NotNull List<@NotNull @Min(-1) @Max(3) Integer> answers) { }
