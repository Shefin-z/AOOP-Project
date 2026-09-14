package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.AdminContentRequest;
import edu.uiu.aoop.careerforge.dto.StudentStatusRequest;
import edu.uiu.aoop.careerforge.service.AdminDashboardService;
import edu.uiu.aoop.careerforge.service.AccessService;
import edu.uiu.aoop.careerforge.service.ResourceImportProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class AdminDashboardController {
    private final AdminDashboardService dashboard;
    private final AccessService access;
    private final ResourceImportProvider resourceImporter;
    public AdminDashboardController(AdminDashboardService dashboard, AccessService access, ResourceImportProvider resourceImporter) {
        this.dashboard = dashboard;
        this.access = access;
        this.resourceImporter = resourceImporter;
    }

    @GetMapping("/admin/overview") public Map<String, Long> overview(@RequestHeader(name = "X-User-Id", required = false) Long id) { return dashboard.overview(id); }
    @GetMapping("/admin/students") public List<Map<String, Object>> students(@RequestHeader(name = "X-User-Id", required = false) Long id) { return dashboard.students(id); }
    @PutMapping("/admin/students/{studentId}/status") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void studentStatus(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long studentId, @Valid @RequestBody StudentStatusRequest request) { dashboard.updateStudentStatus(adminId, studentId, request.status()); }
    @GetMapping("/admin/applications") public List<Map<String, Object>> applications(@RequestHeader(name = "X-User-Id", required = false) Long id) { return dashboard.applications(id); }
    @GetMapping("/admin/content/{kind}") public List<Map<String, Object>> content(@RequestHeader(name = "X-User-Id", required = false) Long id, @PathVariable String kind) { return dashboard.content(id, kind); }
    @PostMapping("/admin/content/{kind}") @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestHeader(name = "X-User-Id", required = false) Long id, @PathVariable String kind, @RequestBody AdminContentRequest request) { return dashboard.createContent(id, kind, request); }
    @PutMapping("/admin/content/{kind}/{itemId}")
    public Map<String, Object> update(@RequestHeader(name = "X-User-Id", required = false) Long id, @PathVariable String kind, @PathVariable Long itemId, @RequestBody AdminContentRequest request) { return dashboard.updateContent(id, kind, itemId, request); }
    @DeleteMapping("/admin/content/{kind}/{itemId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(name = "X-User-Id", required = false) Long id, @PathVariable String kind, @PathVariable Long itemId) { dashboard.deleteContent(id, kind, itemId); }
    @PostMapping("/admin/resources/import")
    public Map<String, Object> importResources(@RequestHeader(name = "X-User-Id", required = false) Long id,
                                               @RequestParam(required = false) String query) {
        access.requireAdmin(id);
        return Map.of("imported", resourceImporter.importResources(id, query));
    }
}
