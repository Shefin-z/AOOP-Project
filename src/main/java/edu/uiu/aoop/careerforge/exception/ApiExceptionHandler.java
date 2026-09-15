package edu.uiu.aoop.careerforge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/** Returns safe, actionable API errors so the frontend does not mislabel provider failures. */
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> responseStatus(ResponseStatusException exception) {
        String message = exception.getReason();
        if (message == null || message.isBlank()) message = "The request could not be completed.";
        return ResponseEntity.status(exception.getStatusCode()).body(Map.of(
                "status", exception.getStatusCode().value(),
                "message", message
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "message", exception.getMessage() == null ? "The request is invalid." : exception.getMessage()
        ));
    }
}
