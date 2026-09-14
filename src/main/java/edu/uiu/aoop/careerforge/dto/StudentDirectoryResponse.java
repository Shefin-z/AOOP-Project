package edu.uiu.aoop.careerforge.dto;

public record StudentDirectoryResponse(Long id, String name, String email, String connectionStatus, Long connectionId, boolean outgoing) { }
