package com.sdcart.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);

    /**
     * Atomic compare-and-swap used during rotation: the old record is marked
     * revoked (and linked to its replacement) only if it is still active.
     * Returns the number of rows updated — {@code 1} on success, {@code 0}
     * when another request already rotated/revoked the token (reuse).
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revoked = true, rt.revokedAt = :now, rt.replacedBy = :replacement
            WHERE rt.id = :id AND rt.revoked = false
            """)
    int markRotated(@Param("id") Long id,
                    @Param("replacement") RefreshToken replacement,
                    @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
