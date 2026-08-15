package com.sdcart.user.dto;

import com.sdcart.user.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID publicId,
        String firstName,
        String lastName,
        String email,
        String phone,
        List<String> roles,
        boolean active,
        boolean emailVerified,
        Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getPublicId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRoles().stream().map(r -> r.getName().name()).sorted().toList(),
                user.isActive(),
                user.isEmailVerified(),
                user.getCreatedAt());
    }
}
