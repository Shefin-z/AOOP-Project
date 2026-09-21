package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class CommunityComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "post_id", nullable = false) private Long postId;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected CommunityComment() { }
    public CommunityComment(Long postId, Long userId, String content) { this.postId = postId; this.userId = userId; this.content = content; this.status = "visible"; }
    public Long getId() { return id; } public Long getPostId() { return postId; } public Long getUserId() { return userId; } public String getContent() { return content; } public String getStatus() { return status; } public LocalDateTime getCreatedAt() { return createdAt; }
    public void remove() { this.status = "removed"; }
}
