package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDate;

public record JobResponse(Long id, String companyName, String companyWebsite, String companyLocation, String title,
                          String location, String employmentType, String workMode, String salaryText,
                          String description, LocalDate expiryDate, String status, java.util.UUID publicUuid,
                          String source, String sourceUrl, Integer minExperienceYears, Integer maxExperienceYears,
                          String validationStatus, java.time.LocalDateTime lastVerifiedAt,
                          String normalizedRole, String extractedSkills, String nlpStatus,
                          java.math.BigDecimal nlpConfidence, java.time.LocalDateTime nlpProcessedAt) { }
