package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(Long id, String authorName, String content, long likeCount, boolean likedByMe, long commentCount, LocalDateTime createdAt, List<CommentResponse> comments) { }
