package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record MessageResponse(Long id, Long connectionId, Long senderId, String senderName, String content, LocalDateTime createdAt, LocalDateTime readAt) { }
