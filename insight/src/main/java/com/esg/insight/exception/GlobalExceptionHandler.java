package com.esg.insight.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", "Access denied: " + (ex.getMessage() != null ? ex.getMessage() : "Insufficient permissions")
                ));
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<?> handleAuthenticationNotFound(AuthenticationCredentialsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", "Authentication required"
                ));
    }
    
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", "Authentication required"
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", ex.getMessage() != null ? ex.getMessage() : "Invalid request parameters"
                ));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Invalid request parameters");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", errorMessage
                ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        // Don't catch Spring Security exceptions as RuntimeException
        if (ex instanceof AccessDeniedException || ex instanceof AuthenticationCredentialsNotFoundException) {
            throw ex;
        }
        
        // Check if this is an AI service error
        String message = ex.getMessage();
        if (message != null && (message.contains("AI service") || message.contains("Failed to connect to AI service"))) {
            // Return user-friendly message for AI service errors
            String userFriendlyMessage = sanitizeErrorMessage(message);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "timestamp", LocalDateTime.now(),
                            "error", userFriendlyMessage
                    ));
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", message != null ? sanitizeErrorMessage(message) : "Bad request"
                ));
    }
    
    /**
     * Sanitize error messages to remove HTML and technical details
     */
    private String sanitizeErrorMessage(String message) {
        if (message == null) {
            return "An error occurred";
        }
        
        // Remove HTML tags if present
        String sanitized = message.replaceAll("<[^>]*>", "");
        
        // Remove URLs if present (keep them short)
        sanitized = sanitized.replaceAll("https?://[^\\s]+", "[AI Service URL]");
        
        // If message is too long or contains HTML remnants, provide generic message
        if (sanitized.length() > 200 || sanitized.contains("<!DOCTYPE") || sanitized.contains("<html")) {
            if (message.contains("502") || message.contains("Bad Gateway")) {
                return "AI service is temporarily unavailable. Please try again in a moment.";
            } else if (message.contains("503") || message.contains("Service Unavailable")) {
                return "AI service is currently busy. Please try again shortly.";
            } else if (message.contains("504") || message.contains("Gateway Timeout")) {
                return "AI service took too long to respond. Please try again.";
            } else if (message.contains("timeout")) {
                return "AI service is taking longer than expected. Please try again.";
            } else {
                return "AI service encountered an error. Please try again later.";
            }
        }
        
        return sanitized.trim();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "error", "Internal server error"
                ));
    }
}
