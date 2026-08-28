package com.sdcart.admin;

import com.sdcart.admin.dto.MonthlyRevenueDto;
import com.sdcart.admin.dto.StatusCountDto;
import com.sdcart.admin.dto.YearlyRevenueDto;
import com.sdcart.order.OrderStatus;
import com.sdcart.payment.PaymentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Business logic for the admin dashboard analytics endpoints.
 * All operations are strictly read-only ({@code readOnly = true}).
 */
@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final AdminDashboardRepository dashboardRepository;

    public AdminDashboardService(AdminDashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    // -------------------------------------------------------------------------
    // Revenue — Yearly
    // -------------------------------------------------------------------------

    /**
     * Returns revenue totals for the last {@code years} calendar years
     * (current year included), ordered oldest → newest.
     * Years with zero qualifying orders are included with {@code totalRevenue = 0}.
     */
    public List<YearlyRevenueDto> getYearlyRevenue(int years) {
        int currentYear = LocalDate.now().getYear();
        int startYear = currentYear - years + 1;

        // Query returns only years that have at least one non-cancelled order
        List<Object[]> rows = dashboardRepository.revenueByYear(startYear);

        // Build a lookup: year → revenue
        Map<Integer, BigDecimal> byYear = new java.util.HashMap<>();
        for (Object[] row : rows) {
            int yr = ((Number) row[0]).intValue();
            BigDecimal rev = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            byYear.put(yr, rev);
        }

        // Fill every year in the window, even years with no orders
        List<YearlyRevenueDto> result = new ArrayList<>(years);
        for (int yr = startYear; yr <= currentYear; yr++) {
            result.add(new YearlyRevenueDto(yr, byYear.getOrDefault(yr, BigDecimal.ZERO)));
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Revenue — Monthly
    // -------------------------------------------------------------------------

    /**
     * Returns all 12 months for {@code year}, each with its revenue total and
     * percentage share of that year's total. Months with no orders show
     * {@code revenue = 0} and {@code percentOfYear = 0.0}.
     */
    public List<MonthlyRevenueDto> getMonthlyRevenue(int year) {
        List<Object[]> rows = dashboardRepository.revenueByMonth(year);

        // Build lookup: month-of-year (1–12) → revenue
        Map<Integer, BigDecimal> byMonth = new java.util.HashMap<>();
        for (Object[] row : rows) {
            int mo = ((Number) row[0]).intValue();
            BigDecimal rev = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            byMonth.put(mo, rev);
        }

        // Sum for percentage calculation
        BigDecimal yearTotal = byMonth.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlyRevenueDto> result = new ArrayList<>(12);
        for (int mo = 1; mo <= 12; mo++) {
            BigDecimal rev = byMonth.getOrDefault(mo, BigDecimal.ZERO);
            double pct = yearTotal.compareTo(BigDecimal.ZERO) == 0
                    ? 0.0
                    : rev.multiply(BigDecimal.valueOf(100))
                         .divide(yearTotal, 1, RoundingMode.HALF_UP)
                         .doubleValue();
            String monthName = Month.of(mo).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(new MonthlyRevenueDto(mo, monthName, rev, pct));
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Payment status summary
    // -------------------------------------------------------------------------

    /**
     * Returns a count+percentage row for every {@link PaymentStatus}.
     * Statuses with zero payments are included so the donut always shows
     * all four segments (or omits them on the frontend when count = 0).
     */
    public List<StatusCountDto> getPaymentStatusSummary() {
        List<Object[]> rows = dashboardRepository.paymentCountByStatus();

        Map<PaymentStatus, Long> counts = new EnumMap<>(PaymentStatus.class);
        for (Object[] row : rows) {
            counts.put((PaymentStatus) row[0], (Long) row[1]);
        }

        long total = counts.values().stream().mapToLong(Long::longValue).sum();

        List<StatusCountDto> result = new ArrayList<>();
        for (PaymentStatus status : PaymentStatus.values()) {
            long count = counts.getOrDefault(status, 0L);
            double pct = total == 0 ? 0.0
                    : Math.round((count * 1000.0 / total)) / 10.0;
            result.add(new StatusCountDto(status.name(), count, pct));
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Order status summary
    // -------------------------------------------------------------------------

    /**
     * Returns a count+percentage row for every {@link OrderStatus}.
     * All statuses (including REFUND_REQUESTED, REFUNDED) are returned;
     * the frontend groups them into the 4-bucket display (Delivered, Pending, Cancelled, Product Refund).
     */
    public List<StatusCountDto> getOrderStatusSummary() {
        List<Object[]> rows = dashboardRepository.orderCountByStatus();

        Map<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
        for (Object[] row : rows) {
            counts.put((OrderStatus) row[0], (Long) row[1]);
        }

        long total = counts.values().stream().mapToLong(Long::longValue).sum();

        List<StatusCountDto> result = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = counts.getOrDefault(status, 0L);
            double pct = total == 0 ? 0.0
                    : Math.round((count * 1000.0 / total)) / 10.0;
            result.add(new StatusCountDto(status.name(), count, pct));
        }
        return result;
    }
}
