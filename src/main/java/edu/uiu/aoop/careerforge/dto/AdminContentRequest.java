package edu.uiu.aoop.careerforge.dto;

public record AdminContentRequest(
        String title, String description, String category, String status,
        String difficulty, Integer durationMinutes, Double passingPercentage,
        String type, String resourceUrl, Integer estimatedMinutes,
        String thumbnailUrl, String providerName, Boolean featured, String recommendationNote,
        String location, String eventUrl, String startsAt, String endsAt, Integer capacity
) { }
