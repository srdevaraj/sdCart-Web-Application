package com.sdcart.admin.dto;

import java.math.BigDecimal;

/**
 * Yearly revenue aggregate for the admin dashboard.
 * {@code totalRevenue} is the sum of {@code total_amount} for all non-CANCELLED
 * orders whose {@code created_at} falls within {@code year}.
 */
public record YearlyRevenueDto(int year, BigDecimal totalRevenue) {}
