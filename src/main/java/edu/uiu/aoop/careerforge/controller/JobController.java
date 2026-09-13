package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.JobRequest;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.service.JobImportProvider;
import edu.uiu.aoop.careerforge.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class JobController {
    private final JobService jobs; private final JobImportProvider importer;
    public JobController(JobService jobs, JobImportProvider importer) { this.jobs = jobs; this.importer = importer; }
    @GetMapping("/jobs") public List<JobResponse> list() { return jobs.listPublished(); }
    @GetMapping("/admin/jobs") public List<JobResponse> adminList(@RequestHeader(name = "X-User-Id", required = false) Long id) { return jobs.listForAdmin(id); }
    @PostMapping("/admin/jobs") @ResponseStatus(HttpStatus.CREATED) public JobResponse create(@RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.create(id, request); }
    @PutMapping("/admin/jobs/{jobId}") public JobResponse update(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.update(jobId, id, request); }
    @DeleteMapping("/admin/jobs/{jobId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id) { jobs.delete(jobId, id); }
    @PostMapping("/admin/jobs/import") public Map<String, Object> importJobs(@RequestHeader(name = "X-User-Id", required = false) Long id) { return Map.of("imported", jobs.importFromProvider(id, importer)); }
}
