package com.sdcart.delivery.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignDeliveryRequest(@NotBlank String deliveryPersonPublicId) {}
