package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileResumeJobMatchingStrategy implements JobMatchingStrategy {
    private final JobMatchCalculator calculator;

    public ProfileResumeJobMatchingStrategy(JobMatchCalculator calculator) { this.calculator = calculator; }

    @Override
    public JobMatch match(Job job, StudentProfile profile, String cvSnapshot) {
        JobMatchCalculator.Result result = calculator.calculate(job, profile, cvSnapshot);
        List<String> reasons = new ArrayList<>(result.reasons());
        if (!result.roleCompatible()) reasons.add("Consider a role closer to your target role.");
        if (!result.experienceCompatible()) reasons.add("Your experience does not meet this listing's stated range.");
        if (profile != null && profile.getUniversity() != null && profile.getDegree() != null) reasons.add("Your education profile is complete.");
        if (reasons.isEmpty()) reasons.add("Complete your profile and CV to improve this match.");
        return new JobMatch(BigDecimal.valueOf(result.score()), List.copyOf(reasons));
    }
}
