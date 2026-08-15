package com.sdcart.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a requested resource does not exist (HTTP 404).
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super(HttpStatus.NOT_FOUND, resource + " not found: " + identifier);
    }
}
