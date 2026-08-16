package edu.uiu.aoop.careerforge.web;
import java.time.Instant; import java.util.Map; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class GlobalExceptionHandler {
 @ExceptionHandler(ApiException.class) ResponseEntity<?> api(ApiException e){return ResponseEntity.status(e.status()).body(Map.of("error",e.getMessage(),"timestamp",Instant.now().toString()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("error",e.getBindingResult().getFieldError()==null?"Validation failed":e.getBindingResult().getFieldError().getDefaultMessage()));}
 @ExceptionHandler(Exception.class) ResponseEntity<?> unknown(Exception e){return ResponseEntity.status(500).body(Map.of("error","Unexpected server error"));}
}
