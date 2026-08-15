package com.sdcart.auth;

import com.sdcart.auth.dto.LoginRequest;
import com.sdcart.auth.dto.RefreshTokenRequest;
import com.sdcart.auth.dto.RegisterRequest;
import com.sdcart.auth.dto.TokenResponse;
import com.sdcart.cart.Cart;
import com.sdcart.cart.CartRepository;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.security.JwtService;
import com.sdcart.security.UserPrincipal;
import com.sdcart.user.Role;
import com.sdcart.user.RoleName;
import com.sdcart.user.RoleRepository;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import com.sdcart.user.dto.UserResponse;
import com.sdcart.wishlist.Wishlist;
import com.sdcart.wishlist.WishlistRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Slf4j
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       CartRepository cartRepository,
                       WishlistRepository wishlistRepository,
                       RefreshTokenRepository refreshTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .active(true)
                .build();
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new IllegalStateException("USER role is missing — run Flyway migrations"));
        user.getRoles().add(userRole);
        user = userRepository.save(user);

        createCartAndWishlist(user);

        log.info("Registered new user id={}", user.getId());
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByEmail(principal.getUsername())
                    .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
            return issueTokens(user);
        } catch (BadCredentialsException | DisabledException ex) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    /**
     * Validates the presented refresh token against its server-side record,
     * then rotates it: the old record is atomically revoked (compare-and-swap)
     * and a new token pair is issued. Reusing an already rotated or revoked
     * token is rejected with 401, so a stolen token cannot be replayed.
     */
    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        Claims claims;
        try {
            claims = jwtService.parseToken(request.refreshToken());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!jwtService.isRefreshToken(claims)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid token type");
        }
        Long userId = Long.valueOf(claims.getSubject());
        RefreshToken record = refreshTokenRepository.findByTokenHash(hash(request.refreshToken()))
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (record.isRevoked()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (record.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (!user.isActive()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Account is disabled");
        }
        return rotate(user, record);
    }

    /**
     * Revokes refresh tokens. With a presented token the specific session is
     * revoked; without one, every active session of the caller is revoked.
     */
    @Transactional
    public void logout(RefreshTokenRequest request) {
        if (request != null && StringUtils.hasText(request.refreshToken())) {
            String token = request.refreshToken().trim();
            refreshTokenRepository.findByTokenHash(hash(token))
                    .ifPresent(record -> {
                        record.setRevoked(true);
                        record.setRevokedAt(Instant.now());
                        log.info("Revoked refresh token id={} for user id={}",
                                record.getId(), record.getUser().getId());
                    });
            return;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            var active = refreshTokenRepository.findByUserIdAndRevokedFalse(principal.id());
            active.forEach(record -> {
                record.setRevoked(true);
                record.setRevokedAt(Instant.now());
            });
            log.info("Revoked {} active refresh token(s) for user id={}", active.size(), principal.id());
        }
    }

    private void createCartAndWishlist(User user) {
        cartRepository.save(Cart.builder().user(user).build());
        wishlistRepository.save(Wishlist.builder().user(user).build());
    }

    private TokenResponse issueTokens(User user) {
        UserPrincipal principal = UserPrincipal.from(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(hash(refreshToken))
                .expiresAt(Instant.now().plusMillis(jwtService.refreshExpirationMs()))
                .build());
        return TokenResponse.of(accessToken, refreshToken, jwtService.accessExpirationMs(),
                UserResponse.from(user));
    }

    private TokenResponse rotate(User user, RefreshToken oldRecord) {
        UserPrincipal principal = UserPrincipal.from(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        // Flush the insert so the FK on replaced_by resolves before the CAS.
        RefreshToken replacement = refreshTokenRepository.saveAndFlush(RefreshToken.builder()
                .user(user)
                .tokenHash(hash(refreshToken))
                .expiresAt(Instant.now().plusMillis(jwtService.refreshExpirationMs()))
                .build());
        int updated = refreshTokenRepository.markRotated(oldRecord.getId(), replacement, Instant.now());
        if (updated != 1) {
            // Someone else already rotated or revoked this token — reject and
            // roll back (the replacement record is discarded with the tx).
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        log.info("Rotated refresh token id={} -> id={} for user id={}",
                oldRecord.getId(), replacement.getId(), user.getId());
        return TokenResponse.of(accessToken, refreshToken, jwtService.accessExpirationMs(),
                UserResponse.from(user));
    }

    /**
     * Only the SHA-256 digest of a refresh token is stored, never the token
     * itself — a leaked database does not expose usable tokens.
     */
    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
