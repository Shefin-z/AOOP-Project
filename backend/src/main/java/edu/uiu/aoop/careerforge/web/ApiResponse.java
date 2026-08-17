package edu.uiu.aoop.careerforge.web;

import java.time.Instant;

/** Stable envelope used by the newer API workflows and integration clients. */
public record ApiResponse<T>(boolean success, String message, T data, Instant timestamp) {

  public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(true, message, data, Instant.now());
  }
}
