package com.sdcart.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    private static final byte[] PNG_HEADER = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0, 0, 0, 0, 0};
    private static final byte[] JPEG_HEADER = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0, 0, 0, 0, 0};

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryService service;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties(
                null, null, null,
                new AppProperties.Cloudinary("deqm6lpf", "api-key", "api-secret"),
                null, null, null);
        service = new CloudinaryService(cloudinary, appProperties);
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void upload_returnsEmptyWithoutTouchingCloudinary_whenNoFiles() {
        assertThat(service.uploadProductImages(null, null)).isEmpty();
        assertThat(service.uploadProductImages(List.of(), List.of())).isEmpty();

        verify(cloudinary, never()).uploader();
    }

    @Test
    void upload_returnsDevFallback_whenNotConfigured() {
        AppProperties appProperties = new AppProperties(
                null, null, null,
                new AppProperties.Cloudinary("", "", ""),
                null, null, null);
        CloudinaryService unconfigured = new CloudinaryService(cloudinary, appProperties);
        MockMultipartFile file = image("photo.png", "image/png");

        List<CloudinaryService.UploadedImage> uploaded = unconfigured.uploadProductImages(List.of(file), null);
        assertThat(uploaded).hasSize(1);
        assertThat(uploaded.get(0).secureUrl()).contains("placehold.co");
    }

    @Test
    void upload_rejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "images", "empty.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> service.uploadProductImages(List.of(file), null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void upload_rejectsUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "images", "doc.pdf", "application/pdf", "not-an-image".getBytes());

        assertThatThrownBy(() -> service.uploadProductImages(List.of(file), null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unsupported image format");
    }

    @Test
    void upload_rejectsOversizedFile() {
        byte[] big = new byte[5 * 1024 * 1024 + 1];
        big[0] = (byte) 0x89;
        big[1] = 0x50;
        big[2] = 0x4E;
        big[3] = 0x47;
        MockMultipartFile file = image("big.png", "image/png", big);

        assertThatThrownBy(() -> service.uploadProductImages(List.of(file), null))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @Test
    void upload_rejectsCorruptedFileDespiteAllowedContentType() {
        // Claims to be a PNG but has a non-image signature.
        MockMultipartFile file = image("fake.png", "image/png", "plain text, not an image".getBytes());

        assertThatThrownBy(() -> service.uploadProductImages(List.of(file), null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not a valid image");
    }

    @Test
    void upload_returnsSecureUrlAndPublicId() throws Exception {
        MockMultipartFile file = image("photo.png", "image/png");
        when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of(
                        "secure_url", "https://res.cloudinary.com/deqm6lpf/image/upload/v1/sdcart/products/photo",
                        "public_id", "sdcart/products/photo"));

        List<CloudinaryService.UploadedImage> uploaded = service.uploadProductImages(List.of(file), List.of("Alt"));

        assertThat(uploaded).hasSize(1);
        assertThat(uploaded.get(0).secureUrl())
                .isEqualTo("https://res.cloudinary.com/deqm6lpf/image/upload/v1/sdcart/products/photo");
        assertThat(uploaded.get(0).publicId()).isEqualTo("sdcart/products/photo");
        verify(uploader).upload(any(byte[].class),
                argThat(opts -> "sdcart/products".equals(opts.get("folder"))));
    }

    @Test
    void upload_compensatesAlreadyUploadedFilesWhenLaterUploadFails() throws Exception {
        MockMultipartFile first = image("one.png", "image/png");
        MockMultipartFile second = image("two.jpg", "image/jpeg", JPEG_HEADER);
        when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of("secure_url", "https://res.cloudinary.com/x/one", "public_id", "sdcart/products/one"))
                .thenThrow(new IOException("upload boom"));

        assertThatThrownBy(() -> service.uploadProductImages(List.of(first, second), null))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getStatus())
                .isEqualTo(HttpStatus.BAD_GATEWAY);

        // The first (already uploaded) asset must be removed again.
        verify(uploader).destroy(eq("sdcart/products/one"), anyMap());
    }

    @Test
    void deleteByPublicIds_swallowsCloudinaryFailures() throws Exception {
        doThrow(new RuntimeException("destroy boom")).when(uploader).destroy(anyString(), anyMap());

        // Must not throw — cleanup failures are logged, never propagated.
        service.deleteByPublicIds(List.of("sdcart/products/one"));
    }

    private MockMultipartFile image(String name, String contentType) {
        return image(name, contentType, PNG_HEADER);
    }

    private MockMultipartFile image(String name, String contentType, byte[] content) {
        return new MockMultipartFile("images", name, contentType, content);
    }
}
