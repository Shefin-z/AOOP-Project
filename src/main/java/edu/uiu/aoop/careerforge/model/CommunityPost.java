package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_posts")
public class CommunityPost {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
    @Column(name = "media_url") private String mediaUrl;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected CommunityPost() { }
    public CommunityPost(Long userId, String content) { this.userId = userId; this.content = content; this.status = "visible"; }
    public Long getId() { return id; } public Long getUserId() { return userId; } public String getContent() { return content; } public String getMediaUrl() { return mediaUrl; } public String getStatus() { return status; } public LocalDateTime getCreatedAt() { return createdAt; }
}
