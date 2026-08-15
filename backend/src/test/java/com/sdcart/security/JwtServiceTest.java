package com.sdcart.security;

import com.sdcart.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private static final String SECRET = "test-secret-that-is-long-enough-for-hs256-signing-0123456789";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = newService(SECRET, 900_000, 604_800_000);
    }

    @Test
    void accessToken_carriesIdentityAndRoles() {
        UserPrincipal principal = principal(42L, "jane@example.com");

        String token = jwtService.generateAccessToken(principal);

        Claims claims = jwtService.parseToken(token);
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(jwtService.isAccessToken(claims)).isTrue();
        assertThat(jwtService.isRefreshToken(claims)).isFalse();
        assertThat(claims.get("email", String.class)).isEqualTo("jane@example.com");
        assertThat(jwtService.rolesOf(claims)).containsExactly("ROLE_USER");
    }

    @Test
    void refreshToken_isTypedAsRefresh() {
        String token = jwtService.generateRefreshToken(42L);

        Claims claims = jwtService.parseToken(token);
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(jwtService.isRefreshToken(claims)).isTrue();
        assertThat(jwtService.isAccessToken(claims)).isFalse();
    }

    @Test
    void expiredToken_isRejected() {
        JwtService shortLived = newService(SECRET, -5_000, 604_800_000);
        String token = shortLived.generateAccessToken(principal(1L, "a@b.com"));

        assertThatThrownBy(() -> shortLived.parseToken(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void tamperedToken_isRejected() {
        String token = jwtService.generateAccessToken(principal(1L, "a@b.com"));

        assertThatThrownBy(() -> jwtService.parseToken(token + "tampered"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void secretShorterThan32Bytes_failsStartupValidation() {
        assertThatThrownBy(() -> newService("way-too-short", 900_000, 604_800_000))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 characters");
    }

    private UserPrincipal principal(long id, String email) {
        return new UserPrincipal(id, email, "hash", true,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private JwtService newService(String secret, long accessMs, long refreshMs) {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});
        AppProperties props = new AppProperties(
                new AppProperties.Jwt(secret, accessMs, refreshMs),
                new AppProperties.Cors("http://localhost:3000"),
                new AppProperties.Admin("admin@sdcart.com", "password"),
                new AppProperties.Cloudinary("", "", ""),
                new AppProperties.Payment("mock", "", ""),
                new AppProperties.Email("console", "no-reply@sdcart.com", "", 587, "", ""),
                new AppProperties.Security(new AppProperties.RateLimit(true, 30)));
        JwtService service = new JwtService(props, environment);
        service.init();
        return service;
    }
}
