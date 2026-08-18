package com.sdcart.admin;

import com.sdcart.common.ApiResponse;
import com.sdcart.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/images")
public class AdminImageController {

    private final CloudinaryService cloudinaryService;

    public AdminImageController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Upload a single image to Cloudinary for use as a category or brand image.
     * Returns the secure HTTPS URL of the uploaded image.
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestPart("image") MultipartFile image) {
        var uploaded = cloudinaryService.uploadProductImages(
                java.util.List.of(image), java.util.List.of(""));

        if (uploaded.isEmpty()) {
            throw new com.sdcart.common.exception.BusinessException("Upload failed");
        }

        String imageUrl = uploaded.get(0).secureUrl();
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded", Map.of("imageUrl", imageUrl)));
    }
}
