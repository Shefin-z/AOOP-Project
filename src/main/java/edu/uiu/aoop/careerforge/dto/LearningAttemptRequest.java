package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record LearningAttemptRequest(@NotNull List<String> answers) { }
