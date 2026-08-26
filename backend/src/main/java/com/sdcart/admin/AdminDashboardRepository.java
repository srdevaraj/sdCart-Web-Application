package com.sdcart.admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Read-only aggregation queries for the admin dashboard analytics section.
 * All queries are SELECT-only and never mutate any domain data.
 *
 * <p>Uses JPQL via {@link EntityManager} so no existing repository interface
 * is modified. Revenue filter: excludes CANCELLED orders, matching the
 * convention already established in the frontend dashboard page.
 */
@Repository
public class AdminDashboardRepository {

    @PersistenceContext
    private EntityManager em;

    /**
     * Returns one row per year ({@code [Integer year, BigDecimal revenue]})
     * for all years >= {@code startYear} that have at least one qualifying order.
     * Years with zero revenue are intentionally omitted here; the service fills
     * in missing years with {@code BigDecimal.ZERO}.
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> revenueByYear(int startYear) {
        return em.createQuery(
                        "SELECT YEAR(o.createdAt), SUM(o.totalAmount) " +
                        "FROM Order o " +
                        "WHERE o.status NOT IN (com.sdcart.order.OrderStatus.CANCELLED, com.sdcart.order.OrderStatus.PAYMENT_FAILED) " +
                        "  AND YEAR(o.createdAt) >= :startYear " +
                        "GROUP BY YEAR(o.createdAt) " +
                        "ORDER BY YEAR(o.createdAt)")
                .setParameter("startYear", startYear)
                .getResultList();
    }

    /**
     * Returns one row per month ({@code [Integer month, BigDecimal revenue]})
     * for all months in {@code year} that have at least one qualifying order.
     * Missing months are filled in with {@code BigDecimal.ZERO} by the service.
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> revenueByMonth(int year) {
        return em.createQuery(
                        "SELECT MONTH(o.createdAt), SUM(o.totalAmount) " +
                        "FROM Order o " +
                        "WHERE o.status NOT IN (com.sdcart.order.OrderStatus.CANCELLED, com.sdcart.order.OrderStatus.PAYMENT_FAILED) " +
                        "  AND YEAR(o.createdAt) = :year " +
                        "GROUP BY MONTH(o.createdAt) " +
                        "ORDER BY MONTH(o.createdAt)")
                .setParameter("year", year)
                .getResultList();
    }

    /**
     * Returns one row per distinct {@code Order.status}
     * ({@code [OrderStatus, Long count]}).
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> orderCountByStatus() {
        return em.createQuery(
                        "SELECT o.status, COUNT(o) " +
                        "FROM Order o " +
                        "GROUP BY o.status")
                .getResultList();
    }

    /**
     * Returns one row per distinct {@code Payment.status}
     * ({@code [PaymentStatus, Long count]}).
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> paymentCountByStatus() {
        return em.createQuery(
                        "SELECT p.status, COUNT(p) " +
                        "FROM Payment p " +
                        "GROUP BY p.status")
                .getResultList();
    }
}
