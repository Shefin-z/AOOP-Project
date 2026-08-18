package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;

import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.event.CareerMilestoneEvent;
import edu.uiu.aoop.careerforge.security.AppPrincipal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Server-timed lifecycle for published, administrator-managed assessments. */
@RestController
@RequestMapping("/assessment-attempts")
public class AssessmentAttemptController {
  private final JdbcTemplate jdbc;
  private final ApplicationEventPublisher events;

  public AssessmentAttemptController(JdbcTemplate jdbc, ApplicationEventPublisher events) {
    this.jdbc = jdbc;
    this.events = events;
  }

  @PostMapping("/assessments/{assessmentId}/start")
  @Transactional
  ApiResponse<Map<String, Object>> start(
      @AuthenticationPrincipal AppPrincipal principal, @PathVariable Long assessmentId) {
    student(principal);
    Map<String, Object> assessment = jdbc.query(
        "SELECT time_limit_minutes FROM assessments WHERE id=? AND status='published'",
        rows -> rows.next() ? Map.of("minutes", rows.getInt("time_limit_minutes")) : null, assessmentId);
    if (assessment == null) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Published assessment not found");
    }
    Integer questionCount = jdbc.queryForObject(
        "SELECT COUNT(*) FROM questions WHERE assessment_id=? AND status='published'", Integer.class, assessmentId);
    if (questionCount == null || questionCount == 0) {
      throw new ApiException(HttpStatus.CONFLICT, "This assessment has no published questions");
    }
    jdbc.update("UPDATE assessment_attempts SET status='expired' WHERE user_id=? AND assessment_id=? AND status='started' AND expires_at<=NOW()", principal.id(), assessmentId);
    Long existing = jdbc.query(
        "SELECT id FROM assessment_attempts WHERE user_id=? AND assessment_id=? AND status='started' AND expires_at>NOW() ORDER BY started_at DESC LIMIT 1",
        rows -> rows.next() ? rows.getLong("id") : null, principal.id(), assessmentId);
    if (existing != null) {
      return ApiResponse.success("Existing attempt resumed", attempt(existing, principal.id()));
    }
    Instant expiresAt = Instant.now().plus(((Number) assessment.get("minutes")).longValue(), ChronoUnit.MINUTES);
    jdbc.update(
        "INSERT INTO assessment_attempts (user_id,assessment_id,started_at,expires_at,status) VALUES (?,?,?,?, 'started')",
        principal.id(), assessmentId, Timestamp.from(Instant.now()), Timestamp.from(expiresAt));
    Long id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    return ApiResponse.success("Assessment attempt started", attempt(id, principal.id()));
  }

  @PostMapping("/{attemptId}/answers")
  @Transactional
  ApiResponse<Map<String, Object>> answer(
      @AuthenticationPrincipal AppPrincipal principal,
      @PathVariable Long attemptId,
      @RequestBody Map<String, Object> body) {
    student(principal);
    ensureOpen(attemptId, principal.id());
    Long questionId = number(body.get("questionId"), "questionId");
    Long optionId = optionalNumber(body.get("optionId"));
    String answerText = text(body.get("answerText"));
    Integer belongs = jdbc.queryForObject(
        "SELECT COUNT(*) FROM questions q JOIN assessment_attempts a ON a.assessment_id=q.assessment_id WHERE q.id=? AND a.id=? AND q.status='published'",
        Integer.class, questionId, attemptId);
    if (belongs == null || belongs == 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Question does not belong to this assessment attempt");
    }
    if (optionId != null) {
      Integer validOption = jdbc.queryForObject("SELECT COUNT(*) FROM question_options WHERE id=? AND question_id=?", Integer.class, optionId, questionId);
      if (validOption == null || validOption == 0) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Answer option is invalid for this question");
      }
    }
    jdbc.update(
        "INSERT INTO assessment_answers (attempt_id,question_id,option_id,answer_text) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE option_id=VALUES(option_id),answer_text=VALUES(answer_text),answered_at=NOW()",
        attemptId, questionId, optionId, answerText.isBlank() ? null : answerText);
    return ApiResponse.success("Answer saved", Map.of("attemptId", attemptId, "questionId", questionId));
  }

  @PostMapping("/{attemptId}/submit")
  @Transactional
  ApiResponse<Map<String, Object>> submit(@AuthenticationPrincipal AppPrincipal principal, @PathVariable Long attemptId) {
    student(principal);
    ensureOpen(attemptId, principal.id());
    List<Map<String, Object>> questions = jdbc.queryForList(
        "SELECT q.id,q.question_type,q.correct_answer,q.points,aa.option_id,aa.answer_text,qo.is_correct "
            + "FROM assessment_attempts a JOIN questions q ON q.assessment_id=a.assessment_id AND q.status='published' "
            + "LEFT JOIN assessment_answers aa ON aa.attempt_id=a.id AND aa.question_id=q.id "
            + "LEFT JOIN question_options qo ON qo.id=aa.option_id WHERE a.id=?",
        attemptId);
    double score = 0;
    double total = 0;
    int correct = 0;
    for (Map<String, Object> question : questions) {
      double points = ((Number) question.get("points")).doubleValue();
      total += points;
      boolean isCorrect = isCorrect(question);
      if (isCorrect) {
        score += points;
        correct++;
      }
      jdbc.update("UPDATE assessment_answers SET is_correct=?,awarded_points=? WHERE attempt_id=? AND question_id=?",
          isCorrect, isCorrect ? points : 0, attemptId, ((Number) question.get("id")).longValue());
    }
    double percentage = total == 0 ? 0 : Math.round(score * 10_000 / total) / 100.0;
    jdbc.update(
        "UPDATE assessment_attempts SET score=?,total_points=?,percentage=?,completed_at=NOW(),status='submitted' WHERE id=?",
        score, total, percentage, attemptId);
    events.publishEvent(new CareerMilestoneEvent(principal.id(), CareerMilestoneEvent.Type.ASSESSMENT_COMPLETED));
    return ApiResponse.success("Assessment submitted", Map.of(
        "attemptId", attemptId, "score", score, "totalPoints", total, "percentage", percentage,
        "correctAnswers", correct, "questionCount", questions.size()));
  }

  private Map<String, Object> attempt(Long id, Long userId) {
    return jdbc.query(
        "SELECT id,assessment_id,started_at,expires_at,status FROM assessment_attempts WHERE id=? AND user_id=?",
        rows -> {
          if (!rows.next()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Assessment attempt not found");
          }
          return Map.of("id", rows.getLong("id"), "assessmentId", rows.getLong("assessment_id"),
              "startedAt", rows.getTimestamp("started_at").toInstant(), "expiresAt", rows.getTimestamp("expires_at").toInstant(),
              "status", rows.getString("status"));
        }, id, userId);
  }

  private void ensureOpen(Long attemptId, Long userId) {
    Map<String, Object> attempt = jdbc.query(
        "SELECT status,expires_at FROM assessment_attempts WHERE id=? AND user_id=?",
        rows -> rows.next() ? Map.of("status", rows.getString("status"), "expiresAt", rows.getTimestamp("expires_at").toInstant()) : null,
        attemptId, userId);
    if (attempt == null) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Assessment attempt not found");
    }
    if ("started".equals(attempt.get("status")) && ((Instant) attempt.get("expiresAt")).isBefore(Instant.now())) {
      jdbc.update("UPDATE assessment_attempts SET status='expired' WHERE id=?", attemptId);
      throw new ApiException(HttpStatus.GONE, "Assessment attempt has expired");
    }
    if (!"started".equals(attempt.get("status"))) {
      throw new ApiException(HttpStatus.CONFLICT, "Assessment attempt is already closed");
    }
  }

  private static boolean isCorrect(Map<String, Object> question) {
    String type = String.valueOf(question.get("question_type"));
    if ("multiple_choice".equals(type) || "true_false".equals(type)) {
      return Boolean.TRUE.equals(question.get("is_correct")) || Integer.valueOf(1).equals(question.get("is_correct"));
    }
    String expected = text(question.get("correct_answer"));
    return !expected.isBlank() && expected.equalsIgnoreCase(text(question.get("answer_text")));
  }

  private static void student(AppPrincipal principal) {
    if (principal.role() != Role.student) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Student account required");
    }
  }

  private static Long number(Object value, String name) {
    Long result = optionalNumber(value);
    if (result == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, name + " must be a number");
    }
    return result;
  }

  private static Long optionalNumber(Object value) {
    try {
      return value == null || String.valueOf(value).isBlank() ? null : Long.valueOf(String.valueOf(value));
    } catch (NumberFormatException exception) {
      return null;
    }
  }

  private static String text(Object value) {
    return value == null ? "" : String.valueOf(value).trim();
  }
}
