package edu.uiu.aoop.careerforge.dto;

import java.math.BigDecimal;
import java.util.List;

public record JobDiscoveryResponse(JobResponse job, BigDecimal matchPercentage, List<String> matchedSkills,
                                   String matchSummary, ScoreBreakdown scoreBreakdown) {
    public record ScoreBreakdown(int role, int experience, int skills, int location, int freshness) { }
}
