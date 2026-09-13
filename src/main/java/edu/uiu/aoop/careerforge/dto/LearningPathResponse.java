package edu.uiu.aoop.careerforge.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record LearningPathResponse(Long id, String topic, String pathType, int levelCount, int nextUnlockedLevel, LocalDateTime createdAt, List<Level> levels) {
    public record Level(int number, String status, BigDecimal bestScore) { }
}
