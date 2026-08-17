package edu.uiu.aoop.careerforge.event;

/** Domain event published by a completed career action. */
public record CareerMilestoneEvent(Long studentId, Type type) {
  public enum Type { PROFILE_COMPLETED, APPLICATION_SUBMITTED, ASSESSMENT_COMPLETED, RESOURCE_COMPLETED, COMMUNITY_POST_CREATED }
}
