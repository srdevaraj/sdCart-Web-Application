package com.sdcart.delivery;

import com.sdcart.common.BaseEntity;
import com.sdcart.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Profile extension for users with the DELIVERY_PERSON role.
 * One-to-one with {@link User}; the FK lives in this table.
 */
@Entity
@Table(name = "delivery_persons")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPerson extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "service_zone", length = 100)
    private String serviceZone;

    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    @Builder.Default
    @Column(name = "is_suspended", nullable = false)
    private boolean suspended = false;
}
