package edu.uiu.aoop.careerforge.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** Deterministic baseline policy; it can be replaced by an AI moderation service later. */
@Component
public class RuleBasedContentSafetyPolicy implements ContentSafetyPolicy {
  @Override
  public Decision assess(String content, String linkUrl) {
    String normalized = content.toLowerCase(Locale.ROOT);
    List<String> reasons = new ArrayList<>();
    int score = 0;
    if (linkUrl != null && !linkUrl.isBlank()) {
      score += 10;
      reasons.add("contains an external link");
    }
    if (normalized.matches(".*(guaranteed income|crypto giveaway|send money|click here now|free followers).*")) {
      score += 50;
      reasons.add("contains a scam or spam phrase");
    }
    if (normalized.replaceAll("[^!]+", "").length() >= 6 || normalized.matches(".*[A-Z]{12,}.*")) {
      score += 25;
      reasons.add("uses excessive emphasis");
    }
    boolean review = score >= 40;
    return new Decision(review ? "pending_review" : "visible", score, review ? "suspicious" : "safe", reasons);
  }
}
