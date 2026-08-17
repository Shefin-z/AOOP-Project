package edu.uiu.aoop.careerforge.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class RuleBasedContentSafetyPolicyTest {

  private final RuleBasedContentSafetyPolicy policy = new RuleBasedContentSafetyPolicy();

  @Test
  void sendsLikelyScamContentForModeration() {
    var decision = policy.assess("Guaranteed income - send money now!!!", "https://example.com");

    assertEquals("pending_review", decision.status());
    assertEquals("suspicious", decision.label());
    assertTrue(decision.score() >= 40);
  }

  @Test
  void acceptsARegularCareerDiscussion() {
    var decision = policy.assess("I learned how to prepare for a technical interview.", "");

    assertEquals("visible", decision.status());
    assertEquals("safe", decision.label());
  }
}
