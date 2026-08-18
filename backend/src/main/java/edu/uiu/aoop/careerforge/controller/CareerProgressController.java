package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;

import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.event.CareerMilestoneEvent;
import edu.uiu.aoop.careerforge.security.AppPrincipal;
import edu.uiu.aoop.careerforge.service.AchievementService;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Persistent Career Vault, document metadata and achievement APIs. */
@RestController
public class CareerProgressController {
  private final JdbcTemplate jdbc;
  private final AchievementService achievements;
  private final ApplicationEventPublisher events;
  public CareerProgressController(JdbcTemplate jdbc, AchievementService achievements, ApplicationEventPublisher events) { this.jdbc=jdbc; this.achievements=achievements; this.events=events; }
  private void student(AppPrincipal principal) { if(principal.role()!=Role.student) throw new ApiException(HttpStatus.FORBIDDEN,"Student account required"); }

  @GetMapping("/achievements") List<Map<String,Object>> achievements(@AuthenticationPrincipal AppPrincipal principal) { student(principal); return achievements.forStudent(principal.id()); }
  @GetMapping("/vault") Map<String,Object> vault(@AuthenticationPrincipal AppPrincipal principal) { student(principal); return Map.of("resumes",jdbc.queryForList("SELECT id,title,content,created_at,updated_at FROM resume_versions WHERE user_id=? ORDER BY updated_at DESC",principal.id()),"documents",jdbc.queryForList("SELECT id,title,file_name,content_type,size_bytes,storage_path,created_at FROM student_documents WHERE user_id=? ORDER BY created_at DESC",principal.id())); }
  @PutMapping("/vault/resume") @Transactional Map<String,Object> saveResume(@AuthenticationPrincipal AppPrincipal principal,@RequestBody Map<String,Object> body) { student(principal); String title=text(body,"title",120); String content=String.valueOf(body.getOrDefault("content","{}")); if(title.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST,"Resume title is required"); Long id=number(body.get("id")); if(id==null){jdbc.update("INSERT INTO resume_versions (user_id,title,content) VALUES (?,?,CAST(? AS JSON))",principal.id(),title,content);id=jdbc.queryForObject("SELECT LAST_INSERT_ID()",Long.class);}else if(jdbc.update("UPDATE resume_versions SET title=?,content=CAST(? AS JSON) WHERE id=? AND user_id=?",title,content,id,principal.id())==0)throw new ApiException(HttpStatus.NOT_FOUND,"Resume not found");return Map.of("id",id,"message","Resume saved"); }
  @DeleteMapping("/vault/documents/{id}") Map<String,Object> deleteDocument(@AuthenticationPrincipal AppPrincipal principal,@PathVariable Long id) { student(principal);if(jdbc.update("DELETE FROM student_documents WHERE id=? AND user_id=?",id,principal.id())==0)throw new ApiException(HttpStatus.NOT_FOUND,"Document not found");return Map.of("message","Document removed"); }
  @PostMapping("/resources/{id}/complete") @Transactional Map<String,Object> completeResource(@AuthenticationPrincipal AppPrincipal principal,@PathVariable Long id) { student(principal);if(jdbc.queryForObject("SELECT COUNT(*) FROM learning_resources WHERE id=? AND status='published'",Integer.class,id)==0)throw new ApiException(HttpStatus.NOT_FOUND,"Resource not found");jdbc.update("INSERT INTO resource_progress (user_id,resource_id,progress_percentage,completed_at) VALUES (?,?,100,NOW()) ON DUPLICATE KEY UPDATE progress_percentage=100,completed_at=NOW()",principal.id(),id);events.publishEvent(new CareerMilestoneEvent(principal.id(),CareerMilestoneEvent.Type.RESOURCE_COMPLETED));return Map.of("message","Learning progress saved"); }
  private static String text(Map<String,Object> body,String key,int maximum){String value=String.valueOf(body.getOrDefault(key,"")).trim();return value.substring(0,Math.min(value.length(),maximum));} private static Long number(Object value){try{return value==null?null:Long.valueOf(String.valueOf(value));}catch(NumberFormatException ignored){return null;}}
}
