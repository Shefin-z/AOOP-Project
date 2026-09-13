package edu.uiu.aoop.careerforge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record ResumeResponse(Long id, String title, JsonNode content, boolean isDefault, LocalDateTime updatedAt) { }
