package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.service.StudentResourceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resources")
public class StudentResourceController {
    private final StudentResourceService resources;

    public StudentResourceController(StudentResourceService resources) {
        this.resources = resources;
    }

    @GetMapping
    public List<Map<String, Object>> published(@RequestHeader(name = "X-User-Id", required = false) Long studentId) {
        return resources.publishedResources(studentId);
    }

    @PutMapping("/{resourceId}/saved")
    public Map<String, Boolean> toggleSaved(@PathVariable Long resourceId, @RequestHeader(name = "X-User-Id", required = false) Long studentId) {
        return resources.toggleSaved(studentId, resourceId);
    }

    @PutMapping("/{resourceId}/completed")
    public Map<String, Boolean> toggleCompleted(@PathVariable Long resourceId, @RequestHeader(name = "X-User-Id", required = false) Long studentId) {
        return resources.toggleCompleted(studentId, resourceId);
    }
}
