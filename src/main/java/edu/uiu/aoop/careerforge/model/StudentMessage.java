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

import java.time.LocalDateTime;

@Entity
@Table(name = "student_messages")
public class StudentMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "connection_id", nullable = false) private StudentConnection connection;
    @Column(name = "sender_id", nullable = false) private Long senderId;
    @Column(nullable = false, length = 2000) private String content;
    @Column(name = "read_at") private LocalDateTime readAt;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected StudentMessage() { }
    public StudentMessage(StudentConnection connection, Long senderId, String content) { this.connection = connection; this.senderId = senderId; this.content = content; }
    public Long getId() { return id; }
    public StudentConnection getConnection() { return connection; }
    public Long getSenderId() { return senderId; }
    public String getContent() { return content; }
    public LocalDateTime getReadAt() { return readAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void markRead() { if (readAt == null) readAt = LocalDateTime.now(); }
}
