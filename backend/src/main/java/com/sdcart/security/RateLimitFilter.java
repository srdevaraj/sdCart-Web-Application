package com.sdcart.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdcart.common.ErrorResponse;
import com.sdcart.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory fixed-window rate limiter protecting sensitive endpoints
 * (login, register, refresh) from brute-force and abuse.
 *
 * <p>Limits are per client IP per fixed 60-second window and are enforced
 * before Spring Security processes the request. This is a single-instance
 * limiter: for multi-instance deployments place a shared limiter (or a WAF /
 * API gateway) in front, or set {@code app.security.rate-limit.enabled=false}.
 */
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L;
    private static final int MAX_ENTRIES = 4096;

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(AppProperties appProperties, ObjectMapper objectMapper) {
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!appProperties.security().rateLimit().enabled()) {
            return true;
        }
        String uri = request.getRequestURI();
        // Only auth endpoints are sensitive to brute-force; everything else
        // is intentionally unrestricted by this filter.
        return !uri.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = clientIp(request) + "|" + request.getRequestURI();
        int limit = appProperties.security().rateLimit().perMinute();

        long now = System.currentTimeMillis();
        Window window = windows.compute(key, (k, current) -> {
            if (current == null || now - current.startedAt() >= WINDOW_MS) {
                return new Window(now, 1);
            }
            return new Window(current.startedAt(), current.count() + 1);
        });
        prune(now);

        if (window.count() > limit) {
            log.warn("Rate limit exceeded for {} on {}", key, request.getRequestURI());
            writeTooManyRequests(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        // Render and typical reverse proxies set X-Forwarded-For; the first
        // entry is the original client. Fall back to the socket address.
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ErrorResponse body = ErrorResponse.of(
                "Too many requests. Please try again later.",
                HttpStatus.TOO_MANY_REQUESTS,
                request.getRequestURI(),
                null,
                MDC.get("requestId"));
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }

    /** Keep the map bounded by dropping expired windows once it grows large. */
    private void prune(long now) {
        if (windows.size() > MAX_ENTRIES) {
            windows.entrySet().removeIf(e -> now - e.getValue().startedAt() > WINDOW_MS);
        }
    }

    private record Window(long startedAt, int count) {
    }
}
