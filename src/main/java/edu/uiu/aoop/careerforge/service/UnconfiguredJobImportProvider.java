package edu.uiu.aoop.careerforge.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UnconfiguredJobImportProvider implements JobImportProvider {
    @Override public int importJobs() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "No external job API is configured yet. Replace UnconfiguredJobImportProvider with your API provider when you select one.");
    }
}
