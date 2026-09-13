package edu.uiu.aoop.careerforge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResumeRequest(@NotBlank @Size(max = 180) String title, @NotNull JsonNode content, boolean isDefault) { }
