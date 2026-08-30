package com.sdcart.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmDeliveryRequest(@NotBlank @Size(min = 6, max = 6) String otp) {}
