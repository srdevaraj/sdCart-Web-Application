package com.sdcart.security;

import com.sdcart.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Issues and validates signed JWT access/refresh tokens (HS256).
 *
 * <p>Access tokens carry the user id, email and roles. Refresh tokens are
 * intentionally minimal (subject + type only) and are rotated on every use.
 */
@Service
public class JwtService {

    private static final String CLAIM_TYPE = "typ";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLES = "roles";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";
    private static final String DEV_DEFAULT_SECRET = "dev-only-secret-change-me-in-production-0123456789abcdef";

    private final AppProperties appProperties;
    private final Environment environment;
    private SecretKey signingKey;

    public JwtService(AppProperties appProperties, Environment environment) {
        this.appProperties = appProperties;
        this.environment = environment;
    }

    @PostConstruct
    void init() {
        byte[] keyBytes = appProperties.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters long. Generate one with: openssl rand -base64 48");
        }
        boolean prod = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (prod && DEV_DEFAULT_SECRET.equals(appProperties.jwt().secret())) {
            throw new IllegalStateException(
                    "JWT_SECRET must be explicitly configured in the production environment");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UserPrincipal principal) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(principal.id()))
                .claim(CLAIM_EMAIL, principal.getUsername())
                .claim(CLAIM_ROLES, principal.getAuthorities().stream()
                        .map(a -> a.getAuthority()).toList())
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(appProperties.jwt().accessExpirationMs())))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                // Unique per token: refresh tokens are otherwise deterministic
                // within the same second (same subject/iat/exp), which would
                // collide in the refresh_tokens.token_hash unique constraint.
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(appProperties.jwt().refreshExpirationMs())))
                .signWith(signingKey)
                .compact();
    }

    public long accessExpirationMs() {
        return appProperties.jwt().accessExpirationMs();
    }

    public long refreshExpirationMs() {
        return appProperties.jwt().refreshExpirationMs();
    }

    /**
     * Parses and verifies a token (signature + expiry).
     *
     * @throws JwtException             if the token is malformed, tampered or expired
     * @throws IllegalArgumentException if the token is null/blank
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(Claims claims) {
        return TYPE_ACCESS.equals(claims.get(CLAIM_TYPE, String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return TYPE_REFRESH.equals(claims.get(CLAIM_TYPE, String.class));
    }

    @SuppressWarnings("unchecked")
    public List<String> rolesOf(Claims claims) {
        return claims.get(CLAIM_ROLES, List.class);
    }
}
