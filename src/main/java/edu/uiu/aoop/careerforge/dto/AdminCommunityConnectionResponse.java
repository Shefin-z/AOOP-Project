package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record AdminCommunityConnectionResponse(Long id, String firstStudent, String secondStudent, String status,
                                               LocalDateTime updatedAt) { }
