package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.service.StudentEventService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
public class StudentEventController {
    private final StudentEventService events;

    public StudentEventController(StudentEventService events) {
        this.events = events;
    }

    @GetMapping
    public List<Map<String, Object>> upcoming(
            @RequestHeader(name = "X-User-Id", required = false) Long studentId) {
        return events.upcomingEvents(studentId);
    }
}
