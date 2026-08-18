package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;

import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.security.AppPrincipal;
import edu.uiu.aoop.careerforge.service.DocumentValidator;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Owner-checked document upload/download endpoints for the Career Vault. */
@RestController
@RequestMapping("/vault/documents")
public class DocumentController {
  private final JdbcTemplate jdbc;
  private final DocumentValidator validator;

  public DocumentController(JdbcTemplate jdbc, DocumentValidator validator) {
    this.jdbc = jdbc;
    this.validator = validator;
  }

  @PostMapping
  @Transactional
  ApiResponse<Map<String, Object>> upload(
      @AuthenticationPrincipal AppPrincipal principal,
      @RequestBody Map<String, Object> body) {
    student(principal);
    var file = validator.validate(text(body, "fileName"), text(body, "contentType"), text(body, "fileData"));
    String title = text(body, "title");
    if (title.isBlank()) {
      title = file.fileName();
    }
    jdbc.update(
        "INSERT INTO student_documents (user_id,title,file_name,content_type,size_bytes,storage_path,file_data) VALUES (?,?,?,?,?,?,?)",
        principal.id(), title, file.fileName(), file.contentType(), file.sizeBytes(), "database://career-vault", file.base64());
    Long id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    return ApiResponse.success("Document uploaded", Map.of("id", id, "fileName", file.fileName(), "sizeBytes", file.sizeBytes()));
  }

  @GetMapping("/{id}/download")
  ResponseEntity<byte[]> download(@AuthenticationPrincipal AppPrincipal principal, @PathVariable Long id) {
    student(principal);
    Map<String, Object> document = jdbc.query(
        "SELECT file_name,content_type,file_data FROM student_documents WHERE id=? AND user_id=?",
        row -> {
          if (!row.next()) {
            return null;
          }
          Map<String, Object> result = new LinkedHashMap<>();
          result.put("fileName", row.getString("file_name"));
          result.put("contentType", row.getString("content_type"));
          result.put("fileData", row.getString("file_data"));
          return result;
        }, id, principal.id());
    if (document == null || text(document, "fileData").isBlank()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Stored document content is not available");
    }
    byte[] bytes = Base64.getDecoder().decode(text(document, "fileData"));
    MediaType mediaType = MediaType.parseMediaType(text(document, "contentType"));
    String fileName = text(document, "fileName").replace("\"", "");
    return ResponseEntity.ok()
        .contentType(mediaType)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
        .body(bytes);
  }

  private static void student(AppPrincipal principal) {
    if (principal.role() != Role.student) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Student account required");
    }
  }

  private static String text(Map<String, Object> values, String key) {
    Object value = values.get(key);
    return value == null ? "" : String.valueOf(value).trim();
  }
}
