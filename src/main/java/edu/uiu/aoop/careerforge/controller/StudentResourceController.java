package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.service.StudentResourceService;
import edu.uiu.aoop.careerforge.service.YouTubeResourceImportProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/resources")
public class StudentResourceController {
    private final StudentResourceService resources;
    private final YouTubeResourceImportProvider youtube;

    public StudentResourceController(StudentResourceService resources, YouTubeResourceImportProvider youtube) {
        this.resources = resources; this.youtube = youtube;
    }

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String skill, @RequestHeader(name = "X-User-Id", required = false) Long studentId) {
        Map<String, Object> result = new HashMap<>(); result.put("suggestions", resources.featuredSuggestions(studentId, skill));
        try { result.put("videos", youtube.searchPlaylists(skill)); }
        catch (ResponseStatusException exception) { result.put("videos", List.of()); result.put("youtubeMessage", exception.getReason()); }
        return result;
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
