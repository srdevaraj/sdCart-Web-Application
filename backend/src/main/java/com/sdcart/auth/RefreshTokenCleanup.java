package com.sdcart.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Keeps the refresh_tokens table bounded by purging expired records once a
 * day. Expired tokens are useless (JWT expiry + DB expiry both reject them),
 * so deleting them does not weaken reuse detection.
 */
@Slf4j
@Component
public class RefreshTokenCleanup {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenCleanup(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /** Runs daily at 03:17 (server-local time), well away from traffic peaks. */
    @Scheduled(cron = "0 17 3 * * *")
    @Transactional
    public void purgeExpired() {
        int deleted = refreshTokenRepository.deleteExpired(Instant.now());
        if (deleted > 0) {
            log.info("Purged {} expired refresh token(s)", deleted);
        }
    }
}
