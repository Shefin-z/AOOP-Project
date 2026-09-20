package edu.uiu.aoop.careerforge.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ContentReportStore {
    private final JdbcTemplate jdbc;
    public ContentReportStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public boolean open(Long postId, Long reporterId, String reason) { return jdbc.update("insert ignore into content_reports (post_id, reporter_id, reason, status) values (?, ?, ?, 'open')", postId, reporterId, reason) == 1; }
    public long openCount(Long postId) { Long count = jdbc.queryForObject("select count(*) from content_reports where post_id = ? and status = 'open'", Long.class, postId); return count == null ? 0 : count; }
    public long openTotal() { Long count = jdbc.queryForObject("select count(*) from content_reports where status = 'open'", Long.class); return count == null ? 0 : count; }
    public void resolveForPost(Long postId, Long reviewerId, String status) { jdbc.update("update content_reports set status = ?, reviewer_id = ?, reviewed_at = current_timestamp where post_id = ? and status = 'open'", status, reviewerId, postId); }
}
