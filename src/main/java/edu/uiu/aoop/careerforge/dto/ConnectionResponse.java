package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record ConnectionResponse(Long id, Long studentId, String studentName, String status, boolean outgoing, long unreadCount,
                                 LocalDateTime updatedAt, boolean online, LocalDateTime lastActiveAt, String profilePhotoUrl) { }
