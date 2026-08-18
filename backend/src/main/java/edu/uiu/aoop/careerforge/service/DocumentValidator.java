package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.exception.ApiException;
import java.util.Base64;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Validates small, locally stored document uploads before a production object store is added. */
@Component
public class DocumentValidator {

  public static final long MAX_BYTES = 5 * 1024 * 1024;
  private static final Set<String> ALLOWED_TYPES = Set.of(
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  public ValidatedDocument validate(String fileName, String contentType, String dataUrl) {
    if (fileName == null || fileName.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "A document file name is required");
    }
    if (!ALLOWED_TYPES.contains(contentType)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF, DOC, and DOCX documents are accepted");
    }
    if (dataUrl == null || dataUrl.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Document content is required");
    }

    String encoded = dataUrl.contains(",") ? dataUrl.substring(dataUrl.indexOf(',') + 1) : dataUrl;
    try {
      byte[] bytes = Base64.getDecoder().decode(encoded);
      if (bytes.length == 0 || bytes.length > MAX_BYTES) {
        throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Documents must be between 1 byte and 5 MB");
      }
      return new ValidatedDocument(fileName.trim(), contentType, encoded, bytes.length);
    } catch (IllegalArgumentException exception) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Document content must be Base64 encoded");
    }
  }

  public record ValidatedDocument(String fileName, String contentType, String base64, long sizeBytes) { }
}
