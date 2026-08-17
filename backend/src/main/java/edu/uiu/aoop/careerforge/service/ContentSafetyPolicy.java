package edu.uiu.aoop.careerforge.service;

import java.util.List;

/** Strategy contract for explainable community-risk checks. */
public interface ContentSafetyPolicy {
  Decision assess(String content, String linkUrl);

  record Decision(String status, int score, String label, List<String> reasons) { }
}
