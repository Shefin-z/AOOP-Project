package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_attempts")
public class LearningAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "level_id", nullable = false) private LearningLevel level;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "correct_answers", nullable = false) private int correctAnswers;
    @Column(name = "total_questions", nullable = false) private int totalQuestions;
    @Column(nullable = false, precision = 5, scale = 2) private BigDecimal percentage;
    @Column(nullable = false) private boolean passed;
    @Column(columnDefinition = "TEXT") private String answers;
    @Column(name = "completed_at", insertable = false, updatable = false) private LocalDateTime completedAt;
    protected LearningAttempt() { }
    public LearningAttempt(LearningLevel level, Long userId, int correctAnswers, int totalQuestions, BigDecimal percentage, boolean passed, String answers) { this.level = level; this.userId = userId; this.correctAnswers = correctAnswers; this.totalQuestions = totalQuestions; this.percentage = percentage; this.passed = passed; this.answers = answers; }
    public LearningLevel getLevel() { return level; } public int getCorrectAnswers() { return correctAnswers; } public int getTotalQuestions() { return totalQuestions; } public BigDecimal getPercentage() { return percentage; } public boolean isPassed() { return passed; }
}
