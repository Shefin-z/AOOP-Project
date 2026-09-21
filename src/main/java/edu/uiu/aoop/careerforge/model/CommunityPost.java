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
    @Column(name = "topic_tags") private String topicTags;
    @Column(nullable = false) private String status;
    @Column(name = "spam_score") private int spamScore;
    @Column(name = "fraud_score") private int fraudScore;
    @Column(name = "risk_score") private int riskScore;
    @Column(name = "risk_label") private String riskLabel;
    @Column(name = "risk_reasons", columnDefinition = "TEXT") private String riskReasons;
    @Column(name = "share_count") private int shareCount;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected CommunityPost() { }
    public CommunityPost(Long userId, String content, String mediaUrl, String topicTags, int spamScore, int fraudScore, int riskScore, String riskLabel, String riskReasons, String status) { this.userId = userId; this.content = content; this.mediaUrl = mediaUrl; this.topicTags = topicTags; this.spamScore = spamScore; this.fraudScore = fraudScore; this.riskScore = riskScore; this.riskLabel = riskLabel; this.riskReasons = riskReasons; this.status = status; }
    public Long getId() { return id; } public Long getUserId() { return userId; } public String getContent() { return content; } public String getMediaUrl() { return mediaUrl; } public String getTopicTags() { return topicTags; } public String getStatus() { return status; } public int getSpamScore() { return spamScore; } public int getFraudScore() { return fraudScore; } public int getRiskScore() { return riskScore; } public String getRiskLabel() { return riskLabel; } public String getRiskReasons() { return riskReasons; } public int getShareCount() { return shareCount; } public LocalDateTime getCreatedAt() { return createdAt; }
    public void moderate(String status) { this.status = status; }
    public void applyModeration(int spamScore, int fraudScore, int riskScore, String riskLabel, String riskReasons, String status) { this.spamScore = spamScore; this.fraudScore = fraudScore; this.riskScore = riskScore; this.riskLabel = riskLabel; this.riskReasons = riskReasons; this.status = status; }
    public void incrementShareCount() { this.shareCount++; }
}
