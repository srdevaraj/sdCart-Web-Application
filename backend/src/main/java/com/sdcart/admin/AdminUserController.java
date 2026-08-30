package com.sdcart.admin;

import com.sdcart.admin.dto.UserStatusRequest;
import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.user.UserService;
import com.sdcart.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listUsers(q, pageable)));
    }

    @PatchMapping("/{publicId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> setActive(@PathVariable UUID publicId,
                                                               @Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated",
                userService.setActive(publicId, request.active())));
    }

    @PatchMapping("/{publicId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable UUID publicId,
            @Valid @RequestBody com.sdcart.admin.dto.UserRoleUpdateRequest request) {
        Long currentAdminId = com.sdcart.security.SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully",
                userService.updateRole(publicId, request, currentAdminId)));
    }
}
