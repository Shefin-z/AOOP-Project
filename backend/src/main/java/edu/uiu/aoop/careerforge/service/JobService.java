package edu.uiu.aoop.careerforge.service;

import java.util.List;
import java.util.Map;

/** Contract used by controllers; implementations may use rule-based or AI-assisted matching. */
public interface JobService {
  List<Map<String,Object>> recommendations(Long userId);
  Map<String,Object> apply(Long userId, Long jobId, Map<String,Object> body);
  Map<String,Object> withdraw(Long userId, Long applicationId);
  List<Map<String,Object>> myApplications(Long userId);
}
