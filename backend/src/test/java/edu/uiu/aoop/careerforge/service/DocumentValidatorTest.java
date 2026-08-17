package edu.uiu.aoop.careerforge.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import edu.uiu.aoop.careerforge.web.ApiException;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class DocumentValidatorTest {

  private final DocumentValidator validator = new DocumentValidator();

  @Test
  void acceptsSmallPdfContent() {
    var document = validator.validate("resume.pdf", "application/pdf", Base64.getEncoder().encodeToString("pdf".getBytes()));

    assertEquals("resume.pdf", document.fileName());
    assertEquals(3, document.sizeBytes());
  }

  @Test
  void rejectsUnsupportedDocumentType() {
    assertThrows(ApiException.class, () -> validator.validate("script.exe", "application/octet-stream", "AA=="));
  }
}
