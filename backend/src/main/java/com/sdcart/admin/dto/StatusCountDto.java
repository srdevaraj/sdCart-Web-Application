package com.sdcart.admin.dto;

/**
 * Count and percentage for one enum status value.
 * Used for both Order-status and Payment-status summaries.
 *
 * @param status     the enum name as stored in the database (e.g. "DELIVERED")
 * @param count      number of rows with this status
 * @param percentage share of the total (0–100, rounded to 1 decimal place)
 */
public record StatusCountDto(String status, long count, double percentage) {}
