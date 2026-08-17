package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/** Keeps privileged mutations reviewable without exposing audit data to students. */
@Service
public class AuditService {
  private final JdbcTemplate jdbc;
  private final ObjectMapper json;

  public AuditService(JdbcTemplate jdbc, ObjectMapper json) {
    this.jdbc = jdbc;
    this.json = json;
  }

  public void record(Long actorId, String action, String entityType, Object entityId, String reason, Map<String, ?> metadata) {
    try {
      jdbc.update(
          "INSERT INTO audit_logs (actor_id,action,reason,entity_type,entity_id,metadata) VALUES (?,?,?,?,?,CAST(? AS JSON))",
          actorId, action, blankToNull(reason), entityType, String.valueOf(entityId), json.writeValueAsString(metadata));
    } catch (Exception exception) {
      throw new IllegalStateException("Audit record could not be saved", exception);
    }
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
