package com.sdcart.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdcart.security.RateLimitFilter;
import com.sdcart.security.RequestIdFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableConfigurationProperties(AppProperties.class)
@EnableScheduling
public class AppConfig {

    /**
     * Correlation ID must wrap every other filter (including Spring Security)
     * so the request ID is available in MDC and error responses everywhere.
     */
    @Bean
    public FilterRegistrationBean<RequestIdFilter> requestIdFilter() {
        FilterRegistrationBean<RequestIdFilter> registration =
                new FilterRegistrationBean<>(new RequestIdFilter());
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    /**
     * Rate limiting runs after the request-ID filter and before Spring
     * Security so brute-force attempts on auth endpoints are rejected with a
     * clean 429 without reaching the authentication code.
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter(AppProperties appProperties,
                                                                    ObjectMapper objectMapper) {
        FilterRegistrationBean<RateLimitFilter> registration =
                new FilterRegistrationBean<>(new RateLimitFilter(appProperties, objectMapper));
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        registration.addUrlPatterns("/api/v1/auth/*");
        return registration;
    }
}
