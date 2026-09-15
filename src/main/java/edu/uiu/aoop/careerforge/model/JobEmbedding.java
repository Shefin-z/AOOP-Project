package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/** Persisted semantic vector for one job listing. The vector is stored as JSON so the current MariaDB schema needs no vector extension. */
@Entity
@Table(name = "job_embeddings")
public class JobEmbedding {
    @Id
    @Column(name = "job_id")
    private Long jobId;
    @Column(nullable = false, length = 80)
    private String model;
    @Column(nullable = false)
    private Integer dimensions;
    @Column(name = "vector_json", nullable = false, columnDefinition = "LONGTEXT")
    private String vectorJson = "[]";
    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "error_message", length = 500)
    private String errorMessage;
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected JobEmbedding() { }
    public JobEmbedding(Long jobId) { this.jobId = jobId; this.status = "pending"; this.vectorJson = "[]"; }
    public Long getJobId() { return jobId; }
    public String getModel() { return model; }
    public Integer getDimensions() { return dimensions; }
    public String getVectorJson() { return vectorJson; }
    public String getContentHash() { return contentHash; }
    public String getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void markProcessing(String model, int dimensions, String hash) { this.model = model; this.dimensions = dimensions; this.vectorJson = this.vectorJson == null ? "[]" : this.vectorJson; this.contentHash = hash; this.status = "processing"; this.errorMessage = null; }
    public void markReady(String model, int dimensions, String vectorJson, String hash) { this.model = model; this.dimensions = dimensions; this.vectorJson = vectorJson; this.contentHash = hash; this.status = "ready"; this.errorMessage = null; }
    public void markFailed(String model, String hash, String message) { this.model = model; this.contentHash = hash; this.status = "failed"; this.errorMessage = message == null ? "Embedding request failed." : message.substring(0, Math.min(500, message.length())); }
}
