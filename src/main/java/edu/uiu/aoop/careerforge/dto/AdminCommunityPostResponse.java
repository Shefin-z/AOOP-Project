package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record AdminCommunityPostResponse(Long id, String authorName, String content, String status,
                                         long likeCount, long commentCount, LocalDateTime createdAt) { }
