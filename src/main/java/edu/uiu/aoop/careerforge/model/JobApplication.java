package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications")
public class JobApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "public_uuid", nullable = false, unique = true, updatable = false, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID publicUuid;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    private String status = "submitted";
    @Column(name = "match_percentage") private java.math.BigDecimal matchPercentage;
    @Column(name = "cover_letter", columnDefinition = "TEXT") private String coverLetter;
    @Column(name = "cv_snapshot", columnDefinition = "json") private String cvSnapshot;
    @Column(name = "match_explanation", columnDefinition = "json") private String matchExplanation;
    @Column(name = "applied_at", insertable = false, updatable = false) private LocalDateTime appliedAt;

    protected JobApplication() { }
    @PrePersist
    void assignPublicUuid() { if (publicUuid == null) publicUuid = UUID.randomUUID(); }
    public JobApplication(Long userId, Job job, String cvSnapshot, java.math.BigDecimal matchPercentage, String matchExplanation) { this.userId = userId; this.job = job; this.cvSnapshot = cvSnapshot; this.matchPercentage = matchPercentage; this.matchExplanation = matchExplanation; }
    public Long getId() { return id; }
    public UUID getPublicUuid() { return publicUuid; }
    public Long getUserId() { return userId; }
    public Job getJob() { return job; }
    public String getStatus() { return status; }
    public java.math.BigDecimal getMatchPercentage() { return matchPercentage; }
    public String getCoverLetter() { return coverLetter; }
    public String getCvSnapshot() { return cvSnapshot; }
    public String getMatchExplanation() { return matchExplanation; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void updateStatus(String status) { this.status = status; }
}
