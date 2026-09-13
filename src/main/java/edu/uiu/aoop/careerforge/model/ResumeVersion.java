package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume_versions")
public class ResumeVersion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    private String title;
    @Column(columnDefinition = "json", nullable = false) private String content;
    @Column(name = "is_default", nullable = false) private boolean isDefault;
    @Column(name = "updated_at", insertable = false, updatable = false) private LocalDateTime updatedAt;
    protected ResumeVersion() { }
    public ResumeVersion(Long userId, String title, String content, boolean isDefault) { this.userId = userId; this.title = title; this.content = content; this.isDefault = isDefault; }
    public Long getId() { return id; } public Long getUserId() { return userId; } public String getTitle() { return title; } public String getContent() { return content; } public boolean isDefault() { return isDefault; } public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void update(String title, String content) { this.title = title; this.content = content; }
    public void setDefault(boolean value) { this.isDefault = value; }
}
