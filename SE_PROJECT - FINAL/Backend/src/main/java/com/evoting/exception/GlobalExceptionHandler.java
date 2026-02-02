package com.evoting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null) {
            if (msg.contains("ALREADY_REGISTERED")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "You have already registered."));
            }
            if (msg.contains("DUPLICATE_IDENTITY")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "This identity is already registered."));
            }
            if (msg.contains("INVALID_ENCRYPTION")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid Identity Proof encryption."));
            }
            if (msg.contains("VOTER_NOT_FOUND")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Voter not found."));
            }
            if (msg.contains("INVALID_STATUS")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg)); // Pass validation
                                                                                                   // message through
            }
        }

        // Log the real error internally here if we had a logger
        // System.err.println(ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An external error occurred."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
