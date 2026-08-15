package com.sdcart.address;

import com.sdcart.address.dto.AddressRequest;
import com.sdcart.address.dto.AddressResponse;
import com.sdcart.common.ApiResponse;
import com.sdcart.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(addressService.list(SecurityUtils.currentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(@Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.create(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Address created", address));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(@PathVariable UUID publicId,
                                                               @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Address updated",
                addressService.update(SecurityUtils.currentUserId(), publicId, request)));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID publicId) {
        addressService.delete(SecurityUtils.currentUserId(), publicId);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted"));
    }

    @PutMapping("/{publicId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok("Default address updated",
                addressService.setDefault(SecurityUtils.currentUserId(), publicId)));
    }
}
