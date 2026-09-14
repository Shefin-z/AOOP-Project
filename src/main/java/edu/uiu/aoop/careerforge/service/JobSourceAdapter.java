package edu.uiu.aoop.careerforge.service;

/** A named external job source that can be selected by the admin sync API. */
public interface JobSourceAdapter extends JobImportProvider {
    String sourceKey();
    String displayName();
}
