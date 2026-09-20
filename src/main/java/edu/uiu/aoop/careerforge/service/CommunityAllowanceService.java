package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.CommunityAllowanceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
public class CommunityAllowanceService {
    private final JdbcTemplate jdbc;
    private final AccessService access;
    public CommunityAllowanceService(JdbcTemplate jdbc, AccessService access) { this.jdbc = jdbc; this.access = access; }

    @Transactional
    public CommunityAllowanceResponse status(Long userId) { access.requireStudent(userId); return current(userId, false); }

    @Transactional
    public CommunityAllowanceResponse consume(Long userId) {
        access.requireStudent(userId);
        CommunityAllowanceResponse current = current(userId, true);
        if (current.points() <= 0) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "You have no Community points left. Your 10 points refresh every two hours.");
        jdbc.update("update community_point_wallets set points = points - 1 where user_id = ?", userId);
        return new CommunityAllowanceResponse(current.points() - 1, current.refreshAt());
    }

    private CommunityAllowanceResponse current(Long userId, boolean lock) {
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("insert ignore into community_point_wallets (user_id, points, refresh_at) values (?, 10, ?)", userId, Timestamp.valueOf(now.plusHours(2)));
        Object[] row = jdbc.queryForObject("select points, refresh_at from community_point_wallets where user_id = ?" + (lock ? " for update" : ""), (rs, number) -> new Object[]{rs.getInt("points"), rs.getTimestamp("refresh_at").toLocalDateTime()}, userId);
        int points = (Integer) row[0]; LocalDateTime refreshAt = (LocalDateTime) row[1];
        if (!refreshAt.isAfter(now)) { refreshAt = now.plusHours(2); points = 10; jdbc.update("update community_point_wallets set points = ?, refresh_at = ? where user_id = ?", points, Timestamp.valueOf(refreshAt), userId); }
        return new CommunityAllowanceResponse(points, refreshAt);
    }
}
