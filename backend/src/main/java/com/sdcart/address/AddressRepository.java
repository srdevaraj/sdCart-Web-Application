package com.sdcart.address;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<Address> findByPublicId(UUID publicId);

    Optional<Address> findByPublicIdAndUserId(UUID publicId, Long userId);

    Optional<Address> findByUserIdAndDefaultAddressTrue(Long userId);

    long countByUserId(Long userId);
}
