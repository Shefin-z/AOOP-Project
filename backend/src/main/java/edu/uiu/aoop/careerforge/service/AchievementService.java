package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.event.CareerMilestoneEvent;
import java.util.*;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Observer that awards idempotent student achievements without coupling feature services to reward logic. */
@Service
public class AchievementService {
  private final JdbcTemplate jdbc;
  public AchievementService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  @EventListener @Transactional
  public void onCareerMilestone(CareerMilestoneEvent event) {
    String code = switch (event.type()) {
      case PROFILE_COMPLETED -> "profile-ready";
      case APPLICATION_SUBMITTED -> "first-application";
      case ASSESSMENT_COMPLETED -> "first-assessment";
      case RESOURCE_COMPLETED -> "continuous-learner";
      case COMMUNITY_POST_CREATED -> "community-contributor";
    };
    String title = switch (event.type()) {
      case PROFILE_COMPLETED -> "Profile ready";
      case APPLICATION_SUBMITTED -> "First application";
      case ASSESSMENT_COMPLETED -> "First assessment";
      case RESOURCE_COMPLETED -> "Continuous learner";
      case COMMUNITY_POST_CREATED -> "Community contributor";
    };
    jdbc.update("INSERT INTO achievements (code,title,description,icon,xp_reward,criteria,status) VALUES (?,?,?,?,?,?, 'active') ON DUPLICATE KEY UPDATE title=VALUES(title)", code,title,"Awarded for a verified CareerForge milestone.","award",50,"{}");
    Long achievementId = jdbc.queryForObject("SELECT id FROM achievements WHERE code=?", Long.class, code);
    jdbc.update("INSERT INTO user_achievements (user_id,achievement_id,progress,unlocked_at) VALUES (?,?,100,NOW()) ON DUPLICATE KEY UPDATE progress=GREATEST(progress,VALUES(progress)), unlocked_at=COALESCE(unlocked_at,VALUES(unlocked_at))", event.studentId(),achievementId);
  }

  @Transactional(readOnly = true)
  public List<Map<String,Object>> forStudent(Long studentId) {
    return jdbc.queryForList("SELECT a.id,a.code,a.title,a.description,a.icon,a.xp_reward,ua.progress,ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=? ORDER BY ua.unlocked_at DESC", studentId);
  }
}
