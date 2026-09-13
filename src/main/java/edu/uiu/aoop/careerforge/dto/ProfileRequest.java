package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @Size(max = 180) String university,
        @Size(max = 180) String degree,
        @Max(2100) Integer graduationYear,
        @Size(max = 180) String targetRole,
        @Size(max = 180) String location,
        @Size(max = 3000) String bio,
        @Size(max = 500) String profilePhotoUrl
) { }
