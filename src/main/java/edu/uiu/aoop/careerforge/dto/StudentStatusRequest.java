package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.Pattern;

public record StudentStatusRequest(
        @Pattern(regexp = "active|suspended", message = "Status must be active or suspended.") String status
) { }
