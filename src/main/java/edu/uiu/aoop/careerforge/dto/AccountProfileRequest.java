package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountProfileRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 190) String email
) { }
