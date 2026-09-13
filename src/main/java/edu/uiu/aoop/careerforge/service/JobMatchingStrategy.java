package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.StudentProfile;

/** Strategy interface: other matching algorithms can replace this implementation later. */
public interface JobMatchingStrategy {
    JobMatch match(Job job, StudentProfile profile, String cvSnapshot);
}
