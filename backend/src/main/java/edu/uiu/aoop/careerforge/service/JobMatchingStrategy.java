package edu.uiu.aoop.careerforge.service;
import edu.uiu.aoop.careerforge.model.Job; import edu.uiu.aoop.careerforge.model.StudentProfile; import java.util.List;
/** Strategy contract: alternative rule-based or AI strategies return the same explainable result. */
public interface JobMatchingStrategy { MatchResult score(StudentProfile profile, Job job, List<String> skills); record MatchResult(int percentage,List<String> matchedSkills,List<String> gaps,List<String> reasons){} }
