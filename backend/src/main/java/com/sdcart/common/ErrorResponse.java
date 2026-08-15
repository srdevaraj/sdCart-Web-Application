package com.sdcart.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

/**
 * Consistent error envelope for every non-2xx API response.
 *
 * @param success   always {@code false} for errors
 * @param message   top-level error message
 * @param status    HTTP status code
 * @param path      request path that produced the error
 * @param timestamp when the error occurred
 * @param requestId correlation ID (X-Request-Id / MDC) for tracing
 * @param errors    field-level violations (validation failures)
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
        boolean success,
        String message,
        int status,
        String path,
        Instant timestamp,
        String requestId,
        List<FieldViolation> errors) {

    public static ErrorResponse of(String message, HttpStatus status, String path, List<FieldViolation> errors) {
        return of(message, status, path, errors, null);
    }

    public static ErrorResponse of(String message, HttpStatus status, String path,
                                   List<FieldViolation> errors, String requestId) {
        return new ErrorResponse(false, message, status.value(), path, Instant.now(), requestId, errors);
    }

    public record FieldViolation(String field, String message) {
    }
}
