package com.sdcart.admin;

import com.sdcart.admin.dto.StatusCountDto;
import com.sdcart.order.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminDashboardServiceTest {

    private AdminDashboardRepository dashboardRepository;
    private AdminDashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardRepository = mock(AdminDashboardRepository.class);
        dashboardService = new AdminDashboardService(dashboardRepository);
    }

    @Test
    void getOrderStatusSummary_includesAllStatusesWithRefunds() {
        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[]{OrderStatus.DELIVERED, 10L});
        rows.add(new Object[]{OrderStatus.PENDING, 5L});
        rows.add(new Object[]{OrderStatus.CANCELLED, 2L});
        rows.add(new Object[]{OrderStatus.REFUND_REQUESTED, 1L});
        rows.add(new Object[]{OrderStatus.REFUNDED, 2L});

        when(dashboardRepository.orderCountByStatus()).thenReturn(rows);

        List<StatusCountDto> summary = dashboardService.getOrderStatusSummary();

        assertThat(summary).hasSize(OrderStatus.values().length);

        Map<String, Long> countMap = summary.stream()
                .collect(Collectors.toMap(StatusCountDto::status, StatusCountDto::count));

        assertThat(countMap.get("DELIVERED")).isEqualTo(10L);
        assertThat(countMap.get("PENDING")).isEqualTo(5L);
        assertThat(countMap.get("CANCELLED")).isEqualTo(2L);
        assertThat(countMap.get("REFUND_REQUESTED")).isEqualTo(1L);
        assertThat(countMap.get("REFUNDED")).isEqualTo(2L);
        assertThat(countMap.get("CONFIRMED")).isEqualTo(0L);
    }
}
