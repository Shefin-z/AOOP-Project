package edu.uiu.aoop.careerforge.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class StudentEventService {
    private final JdbcTemplate jdbc;
    private final AccessService access;

    public StudentEventService(JdbcTemplate jdbc, AccessService access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    public List<Map<String, Object>> upcomingEvents(Long studentId) {
        access.requireStudent(studentId);
        return jdbc.queryForList("""
                select id, title, description, category, location,
                       event_url as eventUrl, starts_at as startsAt,
                       ends_at as endsAt, capacity
                from events
                where status = 'published' and ends_at >= current_timestamp
                order by starts_at asc
                """);
    }
}
