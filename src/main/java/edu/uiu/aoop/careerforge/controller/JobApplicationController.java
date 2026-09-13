package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.JobApplicationRequest;
import edu.uiu.aoop.careerforge.dto.JobApplicationResponse;
import edu.uiu.aoop.careerforge.dto.ApplicationStatusRequest;
import edu.uiu.aoop.careerforge.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@RestController
public class JobApplicationController {
    private final JobApplicationService applications;
    public JobApplicationController(JobApplicationService applications) { this.applications = applications; }
    @PostMapping("/jobs/{jobId}/applications") @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse apply(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody JobApplicationRequest request) { return applications.apply(userId, jobId, request); }
    @GetMapping("/applications")
    public List<JobApplicationResponse> list(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return applications.listForStudent(userId); }
    @PutMapping("/admin/applications/{applicationId}/status")
    public JobApplicationResponse updateStatus(@PathVariable Long applicationId, @RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody ApplicationStatusRequest request) { return applications.updateStatus(userId, applicationId, request.status()); }
}
