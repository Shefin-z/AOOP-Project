package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Machine-readable quick reference for local testers and frontend developers. */
@RestController
public class ApiDocumentationController {

  @GetMapping("/docs")
  ApiResponse<Map<String, Object>> docs() {
    return ApiResponse.success("CareerForge API quick reference", Map.of(
        "baseUrl", "/api",
        "authentication", Map.of(
            "login", "POST /api/auth/login",
            "header", "Authorization: Bearer <token>",
            "studentRegistration", "POST /api/auth/register"),
        "student", List.of(
            "GET/PATCH /api/auth/me",
            "GET /api/student/overview",
            "GET /api/jobs/recommendations",
            "POST /api/jobs/{jobId}/apply",
            "GET /api/vault",
            "POST /api/vault/documents",
            "GET /api/vault/documents/{id}/download"),
        "assessments", List.of(
            "POST /api/assessment-attempts/assessments/{assessmentId}/start",
            "POST /api/assessment-attempts/{attemptId}/answers",
            "POST /api/assessment-attempts/{attemptId}/submit"),
        "admin", List.of(
            "GET /api/admin/users",
            "POST /api/admin/jobs",
            "POST /api/admin/assessments",
            "POST /api/admin/questions",
            "GET/PATCH /api/admin/settings")));
  }
}
