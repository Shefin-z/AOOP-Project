package edu.uiu.aoop.careerforge.dto;

import java.math.BigDecimal;
import java.util.List;

public record LearningAttemptResponse(int correctAnswers, int totalQuestions, BigDecimal percentage, boolean passed, int nextUnlockedLevel, String message, List<QuestionResult> results) {
    public record QuestionResult(int number, String prompt, String selectedAnswer, String correctAnswer, boolean correct, String explanation) { }
}
