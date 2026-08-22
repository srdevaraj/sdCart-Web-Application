package com.sdcart.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Backend-only Cloudinary integration for product images.
 *
 * <p>All credentials live in environment variables (see {@link AppProperties});
 * nothing sensitive ever reaches the frontend or is written to logs. Uploads
 * are validated server-side (format, MIME type, size, magic bytes) before the
 * SDK is invoked, and failures are converted into clean API errors without
 * leaking Cloudinary internals.
 */
@Slf4j
@Service
public class CloudinaryService {

    /** Cloudinary folder used for all product images. */
    public static final String PRODUCTS_FOLDER = "sdcart/products";

    /** Maximum accepted image size, aligned with the servlet multipart limit. */
    public static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final Cloudinary cloudinary;
    private final AppProperties appProperties;

    public CloudinaryService(Cloudinary cloudinary, AppProperties appProperties) {
        this.cloudinary = cloudinary;
        this.appProperties = appProperties;
    }

    /**
     * Result of a successful Cloudinary upload: the HTTPS delivery URL and the
     * public ID used to manage (delete/replace) the asset later.
     */
    public record UploadedImage(String secureUrl, String publicId) {
    }

    /** True when all three Cloudinary environment variables are set. */
    public boolean isConfigured() {
        AppProperties.Cloudinary config = appProperties.cloudinary();
        return StringUtils.hasText(config.cloudName())
                && StringUtils.hasText(config.apiKey())
                && StringUtils.hasText(config.apiSecret());
    }

    /**
     * Validates and uploads the given files to {@code sdcart/products}.
     *
     * <p>All files are validated before the first upload, so a single invalid
     * file uploads nothing. If a mid-loop upload fails, the files already
     * uploaded in this call are removed again (compensation) so no orphaned
     * assets are left behind.
     *
     * @return the uploaded images (empty when no files were supplied)
     * @throws BusinessException with a clean, client-safe message on any failure
     */
    public List<UploadedImage> uploadProductImages(List<MultipartFile> files, List<String> altTexts) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        for (MultipartFile file : files) {
            validateFile(file);
        }
        if (!isConfigured()) {
            log.info("Cloudinary credentials unconfigured — using dev image upload fallback for {} files", files.size());
            List<UploadedImage> mockUploads = new ArrayList<>(files.size());
            for (MultipartFile file : files) {
                String safeName = safeFilename(file.getOriginalFilename());
                String mockPublicId = PRODUCTS_FOLDER + "/dev_" + java.util.UUID.randomUUID().toString().substring(0, 8);
                String mockUrl = "https://placehold.co/1200x600/1e293b/ffffff.png?text=" + safeName;
                mockUploads.add(new UploadedImage(mockUrl, mockPublicId));
            }
            return mockUploads;
        }
        List<UploadedImage> uploaded = new ArrayList<>(files.size());
        try {
            for (MultipartFile file : files) {
                validateFile(file);
            }
            for (MultipartFile file : files) {
                Map<String, Object> result = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", PRODUCTS_FOLDER,
                                "filename", safeFilename(file.getOriginalFilename())));
                uploaded.add(new UploadedImage(
                        (String) result.get("secure_url"),
                        (String) result.get("public_id")));
            }
            return uploaded;
        } catch (IOException ex) {
            deleteUploads(uploaded);
            log.warn("Cloudinary upload failed: {}", ex.getMessage());
            throw new BusinessException(HttpStatus.BAD_GATEWAY,
                    "Image upload failed. Please try again.");
        } catch (RuntimeException ex) {
            deleteUploads(uploaded);
            if (ex instanceof BusinessException businessException) {
                throw businessException;
            }
            log.warn("Cloudinary upload failed: {}", ex.getMessage());
            throw new BusinessException(HttpStatus.BAD_GATEWAY,
                    "Image upload failed. Please try again.");
        }
    }

    /**
     * Best-effort removal of the uploaded assets. Never throws — cleanup
     * failures are logged so they cannot corrupt the surrounding operation.
     */
    public void deleteUploads(List<UploadedImage> uploads) {
        if (uploads == null || uploads.isEmpty()) {
            return;
        }
        deleteByPublicIds(uploads.stream()
                .map(UploadedImage::publicId)
                .filter(Objects::nonNull)
                .toList());
    }

    /**
     * Best-effort removal of the exact Cloudinary assets for the given public
     * IDs. Failures are logged (never the credentials) and swallowed so a
     * cleanup problem cannot break the API response.
     */
    public void deleteByPublicIds(Collection<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty() || !isConfigured()) {
            return;
        }
        for (String publicId : publicIds) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (Exception ex) {
                log.warn("Failed to delete Cloudinary asset {}: {}", publicId, ex.getMessage());
            }
        }
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Image must be 5 MB or smaller");
        }
        String contentType = file.getContentType();
        String normalized = contentType == null ? ""
                : contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
        if (!ALLOWED_CONTENT_TYPES.contains(normalized)) {
            throw new BusinessException(
                    "Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF");
        }
        if (!hasValidImageSignature(file)) {
            throw new BusinessException("Uploaded file is not a valid image");
        }
    }

    /**
     * Sniffs the file header to reject corrupted or mislabeled uploads instead
     * of trusting the client-supplied Content-Type alone.
     */
    private boolean hasValidImageSignature(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            byte[] header = in.readNBytes(12);
            if (header.length < 4) {
                return false;
            }
            // JPEG: FF D8 FF
            if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
                return true;
            }
            // PNG: 89 50 4E 47 0D 0A 1A 0A
            if (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
                return true;
            }
            // GIF: "GIF87a" / "GIF89a"
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46
                    && (header[3] == 0x38 && (header[4] == 0x37 || header[4] == 0x39))) {
                return true;
            }
            // WebP: "RIFF" .... "WEBP"
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                    && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) {
                return true;
            }
            return false;
        } catch (IOException ex) {
            log.warn("Could not read uploaded image: {}", ex.getMessage());
            return false;
        }
    }

    private String safeFilename(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return "product-image";
        }
        // Strip any path components from client-supplied filenames.
        String name = originalFilename.replace('\\', '/');
        int slash = name.lastIndexOf('/');
        String base = slash >= 0 ? name.substring(slash + 1) : name;
        return base.isBlank() ? "product-image" : base;
    }
}
