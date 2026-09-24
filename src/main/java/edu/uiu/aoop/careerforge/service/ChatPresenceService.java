package edu.uiu.aoop.careerforge.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/** Keeps the live socket presence for the private student-chat feature. */
@Service
public class ChatPresenceService {
    private final ConcurrentHashMap<Long, AtomicInteger> socketCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, LocalDateTime> lastActiveAt = new ConcurrentHashMap<>();

    public void connected(Long userId) {
        socketCounts.computeIfAbsent(userId, ignored -> new AtomicInteger()).incrementAndGet();
        lastActiveAt.remove(userId);
    }

    /** @return true when this was the user's final open chat socket. */
    public boolean disconnected(Long userId) {
        AtomicInteger count = socketCounts.get(userId);
        if (count == null) return false;
        if (count.decrementAndGet() > 0) return false;
        socketCounts.remove(userId, count);
        lastActiveAt.put(userId, LocalDateTime.now());
        return true;
    }

    public boolean isOnline(Long userId) {
        AtomicInteger count = socketCounts.get(userId);
        return count != null && count.get() > 0;
    }

    public LocalDateTime lastActiveAt(Long userId) {
        return lastActiveAt.get(userId);
    }
}
