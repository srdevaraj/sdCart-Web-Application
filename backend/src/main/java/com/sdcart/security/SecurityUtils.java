package com.sdcart.security;

import com.sdcart.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Read-only accessors for the currently authenticated principal.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        throw new BusinessException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    public static Long currentUserId() {
        return currentUser().id();
    }
}
