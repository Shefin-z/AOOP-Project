package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

/** Shared audit state for aggregate roots. Entities expose behavior through services, not public fields. */
@MappedSuperclass
public abstract class BaseEntity {
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
  @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
}
