package com.sdcart.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception for expected business rule violations.
 * Carries the HTTP status that should be returned to the client.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
