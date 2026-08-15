package com.sdcart.address;

import com.sdcart.address.dto.AddressRequest;
import com.sdcart.address.dto.AddressResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long userId) {
        return addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Transactional
    public AddressResponse create(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        boolean firstAddress = addressRepository.countByUserId(userId) == 0;
        boolean makeDefault = Boolean.TRUE.equals(request.isDefault()) || firstAddress;
        if (makeDefault) {
            clearDefault(userId);
        }
        Address address = Address.builder()
                .user(user)
                .label(request.label().trim())
                .recipientName(request.recipientName().trim())
                .phone(request.phone().trim())
                .line1(request.line1().trim())
                .line2(request.line2())
                .city(request.city().trim())
                .state(request.state())
                .postalCode(request.postalCode())
                .country(request.country().trim())
                .defaultAddress(makeDefault)
                .build();
        Address saved = addressRepository.save(address);
        log.info("Created address id={} for user id={}", saved.getId(), userId);
        return AddressResponse.from(saved);
    }

    @Transactional
    public AddressResponse update(Long userId, UUID publicId, AddressRequest request) {
        Address address = getOwned(userId, publicId);
        address.setLabel(request.label().trim());
        address.setRecipientName(request.recipientName().trim());
        address.setPhone(request.phone().trim());
        address.setLine1(request.line1().trim());
        address.setLine2(request.line2());
        address.setCity(request.city().trim());
        address.setState(request.state());
        address.setPostalCode(request.postalCode());
        address.setCountry(request.country().trim());
        if (Boolean.TRUE.equals(request.isDefault())) {
            clearDefault(userId);
            address.setDefaultAddress(true);
        }
        return AddressResponse.from(address);
    }

    @Transactional
    public void delete(Long userId, UUID publicId) {
        Address address = getOwned(userId, publicId);
        addressRepository.delete(address);
        if (address.isDefaultAddress()) {
            addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setDefaultAddress(true);
                        log.debug("Promoted address id={} to default", next.getId());
                    });
        }
        log.info("Deleted address id={} for user id={}", address.getId(), userId);
    }

    @Transactional
    public AddressResponse setDefault(Long userId, UUID publicId) {
        Address address = getOwned(userId, publicId);
        clearDefault(userId);
        address.setDefaultAddress(true);
        return AddressResponse.from(address);
    }

    private Address getOwned(Long userId, UUID publicId) {
        Address address = addressRepository.findByPublicIdAndUserId(publicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", publicId));
        return address;
    }

    private void clearDefault(Long userId) {
        addressRepository.findByUserIdAndDefaultAddressTrue(userId)
                .ifPresent(existing -> existing.setDefaultAddress(false));
    }
}
