package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record DocumentResponse(Long id, String fileName, String contentType, Long fileSizeBytes, LocalDateTime createdAt) { }
