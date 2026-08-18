package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;
import edu.uiu.aoop.careerforge.security.AppPrincipal; import edu.uiu.aoop.careerforge.service.JobService; import java.util.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/jobs") public class JobController { private final JobService jobs; public JobController(JobService jobs){this.jobs=jobs;} @GetMapping("/recommendations") Object recommendations(@AuthenticationPrincipal AppPrincipal p){return jobs.recommendations(p.id());} @GetMapping("/applications/mine") List<Map<String,Object>> mine(@AuthenticationPrincipal AppPrincipal p){return jobs.myApplications(p.id());} @PostMapping("/{id}/apply") Map<String,Object> apply(@AuthenticationPrincipal AppPrincipal p,@PathVariable Long id,@RequestBody Map<String,Object> body){return jobs.apply(p.id(),id,body);} @PatchMapping("/applications/{id}/withdraw") Map<String,Object> withdraw(@AuthenticationPrincipal AppPrincipal p,@PathVariable Long id){return jobs.withdraw(p.id(),id);} }
