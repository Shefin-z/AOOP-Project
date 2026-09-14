package edu.uiu.aoop.careerforge.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostLikeStore {
    private final JdbcTemplate jdbc;
    public PostLikeStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public long countForPost(Long postId) { Long count = jdbc.queryForObject("select count(*) from post_likes where post_id = ?", Long.class, postId); return count == null ? 0 : count; }
    public boolean likedBy(Long postId, Long userId) { Integer count = jdbc.queryForObject("select count(*) from post_likes where post_id = ? and user_id = ?", Integer.class, postId, userId); return count != null && count > 0; }
    public void add(Long postId, Long userId) { jdbc.update("insert ignore into post_likes (post_id, user_id) values (?, ?)", postId, userId); }
    public void remove(Long postId, Long userId) { jdbc.update("delete from post_likes where post_id = ? and user_id = ?", postId, userId); }
}
