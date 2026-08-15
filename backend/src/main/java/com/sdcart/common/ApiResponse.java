package com.sdcart.common;

import java.time.Instant;

/**
 * Consistent success envelope for every API response.
 *
 * @param success  always {@code true} for 2xx responses
 * @param message  human-readable summary
 * @param data     payload (may be null)
 * @param timestamp when the response was created
 */
public record ApiResponse<T>(boolean success, String message, T data, Instant timestamp) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    public static ApiResponse<Void> ok(String message) {
        return new ApiResponse<>(true, message, null, Instant.now());
    }
}
