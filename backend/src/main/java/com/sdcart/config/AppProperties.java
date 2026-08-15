package com.sdcart.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly-typed application configuration, bound from {@code app.*}
 * properties (which in turn read from environment variables).
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Cors cors,
        Admin admin,
        Cloudinary cloudinary,
        Payment payment,
        Email email,
        Security security) {

    public record Jwt(String secret, long accessExpirationMs, long refreshExpirationMs) {
    }

    public record Cors(String allowedOrigins) {
    }

    public record Admin(String email, String password) {
    }

    public record Cloudinary(String cloudName, String apiKey, String apiSecret) {
    }

    public record Payment(String provider, String stripeSecretKey, String stripeWebhookSecret) {
    }

    public record Email(String provider, String from, String smtpHost, int smtpPort,
                        String smtpUsername, String smtpPassword) {
    }

    public record Security(RateLimit rateLimit) {
    }

    /**
     * Fixed-window per-IP rate limiting for sensitive auth endpoints.
     * Single-instance only — disable behind a shared limiter or WAF.
     */
    public record RateLimit(boolean enabled, int perMinute) {
    }
}
