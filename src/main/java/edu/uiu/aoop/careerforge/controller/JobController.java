package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.JobRequest;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.dto.JobDiscoveryResponse;
import edu.uiu.aoop.careerforge.service.JobDiscoveryService;
import edu.uiu.aoop.careerforge.service.JobService;
import edu.uiu.aoop.careerforge.service.JobSourceAdapter;
import edu.uiu.aoop.careerforge.service.AccessService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class JobController {
    private final JobService jobs; private final List<JobSourceAdapter> sources; private final JobDiscoveryService discovery; private final AccessService access;
    public JobController(JobService jobs, List<JobSourceAdapter> sources, JobDiscoveryService discovery, AccessService access) { this.jobs = jobs; this.sources = sources; this.discovery = discovery; this.access = access; }
    @GetMapping("/jobs") public List<JobResponse> list() { return jobs.listPublished(); }
    @GetMapping("/jobs/matches") public List<JobDiscoveryResponse> matches(
            @RequestHeader(name = "X-User-Id", required = false) Long id,
            @RequestParam(required = false) String query, @RequestParam(required = false) String location,
            @RequestParam(required = false) String skills, @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String employmentType) {
        return discovery.discover(id, query, location, skills, workMode, employmentType);
    }
    @GetMapping("/admin/jobs") public List<JobResponse> adminList(@RequestHeader(name = "X-User-Id", required = false) Long id) { return jobs.listForAdmin(id); }
    @PostMapping("/admin/jobs") @ResponseStatus(HttpStatus.CREATED) public JobResponse create(@RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.create(id, request); }
    @PutMapping("/admin/jobs/{jobId}") public JobResponse update(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id, @Valid @RequestBody JobRequest request) { return jobs.update(jobId, id, request); }
    @DeleteMapping("/admin/jobs/{jobId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long jobId, @RequestHeader(name = "X-User-Id", required = false) Long id) { jobs.delete(jobId, id); }
    @GetMapping("/admin/jobs/sources")
    public List<Map<String, String>> sourceList(@RequestHeader(name = "X-User-Id", required = false) Long id) {
        requireAdmin(id);
        return sources.stream().map(source -> Map.of("key", source.sourceKey(), "name", source.displayName())).toList();
    }
    @PostMapping("/admin/jobs/import")
    public Map<String, Object> importJobs(@RequestHeader(name = "X-User-Id", required = false) Long id) {
        return sync(id, "remotive");
    }
    @PostMapping("/admin/jobs/sync")
    public Map<String, Object> syncJobs(@RequestHeader(name = "X-User-Id", required = false) Long id,
                                        @RequestParam(defaultValue = "all") String source) {
        return sync(id, source);
    }
    private Map<String, Object> sync(Long id, String requestedSource) {
        requireAdmin(id);
        if ("all".equalsIgnoreCase(requestedSource)) {
            int imported = sources.stream().filter(source -> !"linkedin".equals(source.sourceKey()))
                    .mapToInt(source -> jobs.importFromProvider(id, source)).sum();
            return Map.of("imported", imported, "source", "all");
        }
        JobSourceAdapter source = sources.stream().filter(item -> item.sourceKey().equalsIgnoreCase(requestedSource)).findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown job source: " + requestedSource));
        return Map.of("imported", jobs.importFromProvider(id, source), "source", source.sourceKey());
    }
    private void requireAdmin(Long id) { access.requireAdmin(id); }
}
