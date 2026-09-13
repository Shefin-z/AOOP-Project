package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobApplicationRequest(@NotBlank String cvSourceType, @NotNull Long cvSourceId) { }
