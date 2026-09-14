package edu.uiu.aoop.careerforge.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Keeps LinkedIn as a replaceable source without pretending that unauthorised scraping is reliable. */
@Service
public class LinkedInJobSource implements JobSourceAdapter {
    @Override public String sourceKey() { return "linkedin"; }
    @Override public String displayName() { return "LinkedIn (approved API/feed required)"; }
    @Override public int importJobs() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
                "LinkedIn sync needs an approved API or public feed. Configure that access before enabling this source.");
    }
}
