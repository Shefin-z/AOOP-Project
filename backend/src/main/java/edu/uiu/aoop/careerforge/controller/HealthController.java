package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ApiResponse;
import edu.uiu.aoop.careerforge.exception.ApiException;
import java.time.Instant; import java.util.Map; import org.springframework.jdbc.core.JdbcTemplate; import org.springframework.web.bind.annotation.*;
@RestController public class HealthController { private final JdbcTemplate jdbc; public HealthController(JdbcTemplate jdbc){this.jdbc=jdbc;} @GetMapping("/health") Map<String,Object> health(){try{jdbc.queryForObject("SELECT 1",Integer.class);return Map.of("status","ok","service","careerforge-api","database","healthy","timestamp",Instant.now().toString());}catch(Exception e){return Map.of("status","ok","service","careerforge-api","database","unavailable","timestamp",Instant.now().toString());}} }
