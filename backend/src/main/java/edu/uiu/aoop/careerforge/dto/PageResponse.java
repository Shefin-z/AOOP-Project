package edu.uiu.aoop.careerforge.dto;

import java.util.List;

/** Generic response shape for a paginated API result. */
public record PageResponse<T>(List<T> items, int page, int size, long totalItems) {

  public static <T> PageResponse<T> of(List<T> items, int page, int size, long totalItems) {
    return new PageResponse<>(items, page, size, totalItems);
  }
}
