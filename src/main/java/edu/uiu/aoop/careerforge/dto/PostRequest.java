package edu.uiu.aoop.careerforge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(@NotBlank @Size(max = 5000) String content, @Size(max = 500) String mediaUrl, @Size(max = 500) String topicTags) { }
