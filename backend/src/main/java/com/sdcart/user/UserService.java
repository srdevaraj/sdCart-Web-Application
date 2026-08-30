package com.sdcart.user;

import com.sdcart.admin.dto.UserRoleUpdateRequest;
import com.sdcart.common.PageResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.delivery.DeliveryPerson;
import com.sdcart.delivery.DeliveryPersonRepository;
import com.sdcart.user.dto.ChangePasswordRequest;
import com.sdcart.user.dto.UpdateProfileRequest;
import com.sdcart.user.dto.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       DeliveryPersonRepository deliveryPersonRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.deliveryPersonRepository = deliveryPersonRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(getUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone());
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        log.info("Password changed for user id={}", userId);
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> listUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.search(query, pageable);
        return PageResponse.from(users, UserResponse::from);
    }

    @Transactional
    public UserResponse setActive(UUID publicId, boolean active) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", publicId));
        user.setActive(active);
        log.info("User id={} {} by admin", user.getId(), active ? "activated" : "deactivated");
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateRole(UUID publicId, UserRoleUpdateRequest request, Long currentAdminId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User", publicId));

        if (user.getId().equals(currentAdminId)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "You cannot modify your own role to prevent administrative lockout.");
        }

        boolean isCurrentlyAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMIN);

        if (isCurrentlyAdmin && request.role() != RoleName.ADMIN) {
            long adminCount = userRepository.countByRoleName(RoleName.ADMIN);
            if (adminCount <= 1) {
                throw new BusinessException(HttpStatus.BAD_REQUEST,
                        "Cannot change the role of the last remaining administrator.");
            }
        }

        Role newRole = roleRepository.findByName(request.role())
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Role not found: " + request.role()));

        String oldRoles = user.getRoles().stream().map(r -> r.getName().name()).toList().toString();
        user.getRoles().clear();
        user.getRoles().add(newRole);

        // If promoted to DELIVERY_PERSON, ensure delivery profile exists
        if (request.role() == RoleName.DELIVERY_PERSON) {
            DeliveryPerson dp = deliveryPersonRepository.findByUserId(user.getId())
                    .orElseGet(() -> DeliveryPerson.builder().user(user).build());

            if (request.vehicleType() != null && !request.vehicleType().isBlank()) {
                dp.setVehicleType(request.vehicleType().trim());
            } else if (dp.getVehicleType() == null) {
                dp.setVehicleType("Standard");
            }

            if (request.serviceZone() != null && !request.serviceZone().isBlank()) {
                dp.setServiceZone(request.serviceZone().trim());
            } else if (dp.getServiceZone() == null) {
                dp.setServiceZone("General");
            }

            dp.setSuspended(false);
            dp.setAvailable(true);
            deliveryPersonRepository.save(dp);
        }

        User savedUser = userRepository.save(user);

        log.info("Admin userId={} changed user id={} publicId={} role from {} to {} at {}",
                currentAdminId, savedUser.getId(), savedUser.getPublicId(), oldRoles, request.role(), Instant.now());

        return UserResponse.from(savedUser);
    }

    public User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }
}
