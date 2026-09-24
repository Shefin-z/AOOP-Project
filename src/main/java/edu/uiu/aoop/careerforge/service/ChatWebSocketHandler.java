package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.dto.MessageResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ExecutorService;

/** A client-server WebSocket channel for messages between accepted student connections. */
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper json;
    private final CommunityChatService community;
    private final ExecutorService communityChatExecutor;
    private final ChatPresenceService presence;
    private final ConcurrentHashMap<Long, CopyOnWriteArraySet<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    public ChatWebSocketHandler(ObjectMapper json, CommunityChatService community, ExecutorService communityChatExecutor, ChatPresenceService presence) {
        this.json = json; this.community = community; this.communityChatExecutor = communityChatExecutor; this.presence = presence;
    }

    @Override public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = userId(session);
        if (userId == null) { session.close(CloseStatus.NOT_ACCEPTABLE.withReason("A student session is required.")); return; }
        try { community.openSocket(userId); } catch (Exception ignored) { session.close(CloseStatus.NOT_ACCEPTABLE.withReason("A valid student session is required.")); return; }
        sessionsByUser.computeIfAbsent(userId, ignored -> new CopyOnWriteArraySet<>()).add(session);
        presence.connected(userId);
        send(session, json.writeValueAsString(java.util.Map.of("type", "connected")));
        broadcastPresence(userId);
    }

    @Override protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        Long userId = userId(session);
        if (userId != null) communityChatExecutor.execute(() -> process(userId, session, message.getPayload()));
    }

    private void process(Long userId, WebSocketSession session, String payload) {
        try {
            JsonNode request = json.readTree(payload);
            long connectionId = request.path("connectionId").asLong(0);
            if (connectionId <= 0) throw new IllegalArgumentException("A connection is required.");
            MessageResponse saved = community.send(userId, connectionId, request.path("content").asText(""));
            String response = json.writeValueAsString(java.util.Map.of("type", "message", "message", saved));
            List<Long> recipients = community.participants(connectionId, userId);
            recipients.forEach(recipient -> sessionsByUser.getOrDefault(recipient, new CopyOnWriteArraySet<>()).forEach(target -> send(target, response)));
        } catch (Exception exception) {
            try { send(session, json.writeValueAsString(java.util.Map.of("type", "error", "message", clientMessage(exception)))); } catch (Exception ignored) { }
        }
    }

    @Override public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = userId(session);
        if (userId == null) return;
        CopyOnWriteArraySet<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            boolean wentOffline = presence.disconnected(userId);
            if (sessions.isEmpty()) sessionsByUser.remove(userId, sessions);
            if (wentOffline) broadcastPresence(userId);
        }
    }

    private void broadcastPresence(Long userId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "presence");
            payload.put("userId", userId);
            payload.put("online", presence.isOnline(userId));
            payload.put("lastActiveAt", presence.lastActiveAt(userId));
            String packet = json.writeValueAsString(payload);
            community.connectedStudents(userId).forEach(recipient -> sessionsByUser.getOrDefault(recipient, new CopyOnWriteArraySet<>()).forEach(target -> send(target, packet)));
        } catch (Exception ignored) { }
    }

    private void send(WebSocketSession session, String payload) { try { synchronized (session) { if (session.isOpen()) session.sendMessage(new TextMessage(payload)); } } catch (Exception ignored) { } }
    private Long userId(WebSocketSession session) {
        URI uri = session.getUri(); if (uri == null || uri.getQuery() == null) return null;
        for (String item : uri.getQuery().split("&")) if (item.startsWith("userId=")) try { return Long.valueOf(item.substring(7)); } catch (NumberFormatException ignored) { return null; }
        return null;
    }
    private String clientMessage(Exception exception) { return exception.getMessage() == null ? "Unable to send the message." : exception.getMessage(); }
}
