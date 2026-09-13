package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class StudentDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "resume_version_id") private Long resumeVersionId;
    @Column(name = "file_name", nullable = false) private String fileName;
    @Column(name = "content_type", nullable = false) private String contentType;
    @Column(name = "storage_path", nullable = false) private String storagePath;
    @Column(name = "file_size_bytes", nullable = false) private Long fileSizeBytes;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
    protected StudentDocument() { }
    public StudentDocument(Long userId, String fileName, String contentType, String storagePath, Long fileSizeBytes) { this.userId = userId; this.fileName = fileName; this.contentType = contentType; this.storagePath = storagePath; this.fileSizeBytes = fileSizeBytes; }
    public Long getId() { return id; } public Long getUserId() { return userId; } public String getFileName() { return fileName; } public String getContentType() { return contentType; } public String getStoragePath() { return storagePath; } public Long getFileSizeBytes() { return fileSizeBytes; } public LocalDateTime getCreatedAt() { return createdAt; }
}
