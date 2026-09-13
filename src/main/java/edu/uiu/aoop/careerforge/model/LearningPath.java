package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_paths")
public class LearningPath {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false) private String topic;
    @Column(name = "path_type", nullable = false) private String pathType;
    @Column(name = "level_count", nullable = false) private int levelCount;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected LearningPath() { }
    public LearningPath(Long userId, String topic, String pathType, int levelCount) { this.userId = userId; this.topic = topic; this.pathType = pathType; this.levelCount = levelCount; }
    public Long getId() { return id; } public Long getUserId() { return userId; } public String getTopic() { return topic; } public String getPathType() { return pathType; } public int getLevelCount() { return levelCount; } public LocalDateTime getCreatedAt() { return createdAt; }
}
