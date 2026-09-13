package edu.uiu.aoop.careerforge.dto;

import java.util.UUID;

public record AuthResponse(Long id, String name, String email, String role, UUID publicUuid) { }
