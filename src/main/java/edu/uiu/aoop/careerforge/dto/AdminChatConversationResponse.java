package edu.uiu.aoop.careerforge.dto;

import java.time.LocalDateTime;

/** Read-only conversation summary shown in the administrator's live-chat monitor. */
public record AdminChatConversationResponse(Long id, String firstStudentName, String secondStudentName,
                                            String lastMessagePreview, LocalDateTime lastMessageAt,
                                            long messageCount) { }
