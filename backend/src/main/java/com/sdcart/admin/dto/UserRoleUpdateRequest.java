package com.sdcart.admin.dto;

import com.sdcart.user.RoleName;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(
        @NotNull RoleName role,
        String vehicleType,
        String serviceZone
) {}
