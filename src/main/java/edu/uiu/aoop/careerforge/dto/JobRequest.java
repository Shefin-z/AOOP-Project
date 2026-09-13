package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record JobRequest(
        @NotBlank @Size(max = 180) String companyName,
        @Size(max = 500) String companyWebsite,
        @Size(max = 180) String companyLocation,
        @NotBlank @Size(max = 220) String title,
        @Size(max = 180) String location,
        @NotBlank String employmentType,
        @NotBlank String workMode,
        @Size(max = 120) String salaryText,
        @NotBlank @Size(max = 10000) String description,
        @NotNull LocalDate expiryDate,
        @NotBlank String status
) { }
