package com.sdcart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Assigns a correlation ID to every request.
 *
 * <p>The ID is propagated to the client via the {@code X-Request-Id} response
 * header, placed in the SLF4J MDC under {@code requestId} so every log line
 * from the request carries it, and echoed back in error responses (see
 * {@code ErrorResponse}). Incoming {@code X-Request-Id} headers are honored
 * so edge proxies can propagate their own trace IDs.
 *
 * <p>Failed requests (4xx/5xx) are logged with method, path, status and
 * duration so production issues are traceable without logging any secrets.
 */
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    static final String MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestId = sanitize(request.getHeader("X-Request-Id"));
        if (requestId == null) {
            requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }
        MDC.put(MDC_KEY, requestId);
        response.setHeader("X-Request-Id", requestId);

        long start = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            int status = response.getStatus();
            if (status >= 500) {
                log.error("Request failed: {} {} -> {} ({} ms) [{}]",
                        request.getMethod(), request.getRequestURI(), status, elapsedMs, requestId);
            } else if (status >= 400) {
                log.warn("Request failed: {} {} -> {} ({} ms) [{}]",
                        request.getMethod(), request.getRequestURI(), status, elapsedMs, requestId);
            }
            MDC.remove(MDC_KEY);
        }
    }

    private String sanitize(String header) {
        if (!StringUtils.hasText(header)) {
            return null;
        }
        String trimmed = header.trim();
        return trimmed.length() > 64 ? trimmed.substring(0, 64) : trimmed;
    }
}
