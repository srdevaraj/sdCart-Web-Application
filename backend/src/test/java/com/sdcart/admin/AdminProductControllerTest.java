package com.sdcart.admin;

import com.sdcart.common.GlobalExceptionHandler;
import com.sdcart.product.ProductService;
import com.sdcart.product.ProductStatus;
import com.sdcart.product.dto.ProductCreateRequest;
import com.sdcart.product.dto.ProductResponse;
import com.sdcart.product.dto.ProductUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies the admin product endpoints route by Content-Type: the JSON
 * contract keeps working unchanged, and the multipart variant binds the JSON
 * {@code product} part, the repeated {@code images} file parts and the
 * parallel {@code altTexts} part.
 */
class AdminProductControllerTest {

    private MockMvc mockMvc;
    private ProductService productService;

    private static final byte[] PNG = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0, 0, 0, 0, 0};

    @BeforeEach
    void setUp() {
        productService = mock(ProductService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AdminProductController(productService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void jsonCreate_keepsUrlBasedContract() throws Exception {
        when(productService.createProduct(any(ProductCreateRequest.class))).thenReturn(response());

        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Widget\",\"price\":10.0,"
                                + "\"images\":[{\"imageUrl\":\"https://example.com/a.jpg\"}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Widget"));

        verify(productService).createProduct(any(ProductCreateRequest.class));
    }

    @Test
    void jsonCreate_stillValidatesProductFields() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":10.0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void multipartCreate_bindsProductJsonImagesAndAltTexts() throws Exception {
        when(productService.createProduct(any(ProductCreateRequest.class), anyList(), anyList()))
                .thenReturn(response());

        mockMvc.perform(multipart("/api/v1/admin/products")
                        .file(new MockMultipartFile("product", "", "application/json",
                                "{\"name\":\"Widget\",\"price\":10.0,\"stockQuantity\":5}".getBytes()))
                        .file(new MockMultipartFile("images", "a.png", "image/png", PNG))
                        .file(new MockMultipartFile("images", "b.png", "image/png", PNG))
                        .file(new MockMultipartFile("altTexts", "", "application/json",
                                "[\"Front\",\"Back\"]".getBytes())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Widget"));

        verify(productService).createProduct(
                argThat(request -> "Widget".equals(request.name()) && request.images() == null),
                argThat(files -> files.size() == 2),
                argThat(altTexts -> altTexts.size() == 2 && altTexts.get(1).equals("Back")));
    }

    @Test
    void multipartUpdate_bindsProductJson() throws Exception {
        UUID publicId = UUID.randomUUID();
        when(productService.updateProduct(eq(publicId), any(), anyList(), anyList()))
                .thenReturn(response());

        mockMvc.perform(multipart(HttpMethod.PUT, "/api/v1/admin/products/{publicId}", publicId)
                        .file(new MockMultipartFile("product", "", "application/json",
                                "{\"price\":12.5}".getBytes()))
                        .file(new MockMultipartFile("images", "new.png", "image/png", PNG)))
                .andExpect(status().isOk());

        verify(productService).updateProduct(
                eq(publicId),
                any(),
                argThat(files -> files.size() == 1),
                any());
    }

    @Test
    void jsonUpdate_keepsWorkingWithoutImagesPart() throws Exception {
        UUID publicId = UUID.randomUUID();
        when(productService.updateProduct(eq(publicId), any(ProductUpdateRequest.class)))
                .thenReturn(response());

        mockMvc.perform(put("/api/v1/admin/products/{publicId}", publicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":12.5}"))
                .andExpect(status().isOk());

        verify(productService).updateProduct(eq(publicId), any(ProductUpdateRequest.class));
    }

    private ProductResponse response() {
        return new ProductResponse(
                UUID.randomUUID(),
                "Widget",
                "widget",
                null,
                null,
                null,
                new BigDecimal("10.00"),
                null,
                5,
                ProductStatus.ACTIVE,
                false,
                BigDecimal.ZERO,
                0,
                null,
                null,
                List.of(),
                List.of(),
                Instant.now());
    }
}
