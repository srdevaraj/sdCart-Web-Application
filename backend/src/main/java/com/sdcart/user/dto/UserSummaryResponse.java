package com.sdcart.user.dto;

import com.sdcart.user.User;

import java.util.UUID;

public record UserSummaryResponse(
        UUID publicId,
        String firstName,
        String lastName) {

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(user.getPublicId(), user.getFirstName(), user.getLastName());
    }
}
