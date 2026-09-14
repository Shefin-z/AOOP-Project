package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotNull;

public record ConnectionRequest(@NotNull Long studentId) { }
