package com.sdcart.admin;

import com.sdcart.admin.dto.MonthlyRevenueDto;
import com.sdcart.admin.dto.StatusCountDto;
import com.sdcart.admin.dto.YearlyRevenueDto;
import com.sdcart.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only analytics endpoints for the admin dashboard.
 * All endpoints require ADMIN role (enforced by the existing security config
 * which guards the entire {@code /api/v1/admin/**} path).
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Returns total revenue per calendar year for the last {@code years} years
     * (default 5). Years with zero qualifying orders are included with revenue=0.
     *
     * <p>Revenue criterion: orders with status != CANCELLED.
     */
    @GetMapping("/revenue/yearly")
    public ResponseEntity<ApiResponse<List<YearlyRevenueDto>>> revenueYearly(
            @RequestParam(defaultValue = "5") int years) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getYearlyRevenue(years)));
    }

    /**
     * Returns the 12-month revenue breakdown for {@code year}.
     * Each month includes {@code percentOfYear} (0–100) and a short month name.
     */
    @GetMapping("/revenue/yearly/{year}/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueDto>>> revenueMonthly(
            @PathVariable int year) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getMonthlyRevenue(year)));
    }

    /**
     * Returns a count + percentage entry for every {@code PaymentStatus} value.
     * Statuses with zero payments are included (count = 0, percentage = 0.0).
     */
    @GetMapping("/payments/status-summary")
    public ResponseEntity<ApiResponse<List<StatusCountDto>>> paymentStatusSummary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getPaymentStatusSummary()));
    }

    /**
     * Returns a count + percentage entry for every {@code OrderStatus} value.
     * The frontend groups PENDING + CONFIRMED + SHIPPED into an "In Progress" bucket.
     */
    @GetMapping("/orders/status-summary")
    public ResponseEntity<ApiResponse<List<StatusCountDto>>> orderStatusSummary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOrderStatusSummary()));
    }
}
