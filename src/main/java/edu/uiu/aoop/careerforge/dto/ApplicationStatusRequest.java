package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Pattern;

public record ApplicationStatusRequest(
        @Pattern(regexp = "submitted|under_review|shortlisted|rejected|cancelled", message = "Use a valid application status.") String status
) { }
