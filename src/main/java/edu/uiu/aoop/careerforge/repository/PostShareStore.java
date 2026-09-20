package edu.uiu.aoop.careerforge.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostShareStore {
    private final JdbcTemplate jdbc;
    public PostShareStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public boolean addOnce(Long postId, Long userId) { return jdbc.update("insert ignore into post_shares (post_id, user_id) values (?, ?)", postId, userId) == 1; }
    public boolean sharedBy(Long postId, Long userId) { Integer count = jdbc.queryForObject("select count(*) from post_shares where post_id = ? and user_id = ?", Integer.class, postId, userId); return count != null && count > 0; }
}
