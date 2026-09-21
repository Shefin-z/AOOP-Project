package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

public record AdminCommunityPostResponse(Long id, String authorName, String content, String status,
                                         int spamScore, int fraudScore, int riskScore, String riskLabel,
                                         String riskReasons, long reportCount, long likeCount, long commentCount,
                                         LocalDateTime createdAt) { }
