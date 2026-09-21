package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(Long id, String authorName, String content, String mediaUrl, String topicTags, String status,
                           int riskScore, String riskLabel, long likeCount, boolean likedByMe, int shareCount,
                           boolean sharedByMe, long commentCount, LocalDateTime createdAt, List<CommentResponse> comments) { }
