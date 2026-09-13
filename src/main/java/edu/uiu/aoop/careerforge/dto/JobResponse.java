package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDate;

public record JobResponse(Long id, String companyName, String companyWebsite, String companyLocation, String title,
                          String location, String employmentType, String workMode, String salaryText,
                          String description, LocalDate expiryDate, String status, java.util.UUID publicUuid) { }
