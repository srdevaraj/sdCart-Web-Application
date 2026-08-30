package com.sdcart.delivery.dto;

import com.sdcart.delivery.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public record DeliveryStatusUpdateRequest(@NotNull DeliveryStatus status) {}
