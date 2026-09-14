package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_connections")
public class StudentConnection {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_low_id", nullable = false) private Long userLowId;
    @Column(name = "user_high_id", nullable = false) private Long userHighId;
    @Column(name = "requested_by", nullable = false) private Long requestedBy;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", insertable = false, updatable = false) private LocalDateTime updatedAt;

    protected StudentConnection() { }
    public StudentConnection(Long firstUserId, Long secondUserId, Long requestedBy) {
        this.userLowId = Math.min(firstUserId, secondUserId);
        this.userHighId = Math.max(firstUserId, secondUserId);
        this.requestedBy = requestedBy;
        this.status = "pending";
    }
    public Long getId() { return id; }
    public Long getUserLowId() { return userLowId; }
    public Long getUserHighId() { return userHighId; }
    public Long getRequestedBy() { return requestedBy; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public boolean includes(Long userId) { return userLowId.equals(userId) || userHighId.equals(userId); }
    public Long otherUserId(Long userId) { return userLowId.equals(userId) ? userHighId : userLowId; }
    public void accept() { this.status = "accepted"; }
}
