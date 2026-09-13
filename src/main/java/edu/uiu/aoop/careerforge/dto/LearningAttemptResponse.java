package edu.uiu.aoop.careerforge.dto;

import java.math.BigDecimal;

public record LearningAttemptResponse(int correctAnswers, int totalQuestions, BigDecimal percentage, boolean passed, int nextUnlockedLevel, String message) { }
