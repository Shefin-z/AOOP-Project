package edu.uiu.aoop.careerforge.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobApplicationResponse(Long id, Long jobId, String jobTitle, String companyName, String status,
                                     BigDecimal matchPercentage, java.util.List<String> matchReasons, String cvTitle, LocalDateTime appliedAt,
                                     java.util.UUID publicUuid, java.util.UUID jobPublicUuid) { }
