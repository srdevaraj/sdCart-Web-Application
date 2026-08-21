package com.sdcart.admin.dto;

import java.math.BigDecimal;

/**
 * Per-month revenue aggregate for a specific year.
 * All 12 months are always returned; months with no qualifying orders have
 * {@code revenue = 0} and {@code percentOfYear = 0.0}.
 */
public record MonthlyRevenueDto(
        int month,
        String monthName,
        BigDecimal revenue,
        double percentOfYear
) {}
