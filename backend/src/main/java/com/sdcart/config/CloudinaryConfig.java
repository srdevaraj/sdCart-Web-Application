package com.sdcart.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Exposes the Cloudinary SDK instance configured exclusively from environment
 * variables ({@code CLOUDINARY_CLOUD_NAME}, {@code CLOUDINARY_API_KEY},
 * {@code CLOUDINARY_API_SECRET}) bound through {@link AppProperties}.
 *
 * <p>Credentials are never hard-coded and never logged. The bean is always
 * created — even when the variables are empty — so the application starts
 * without Cloudinary; {@link com.sdcart.service.CloudinaryService} then
 * returns a controlled error instead of attempting an unconfigured upload.
 */
@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(AppProperties appProperties) {
        AppProperties.Cloudinary cloudinary = appProperties.cloudinary();
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudinary.cloudName());
        config.put("api_key", cloudinary.apiKey());
        config.put("api_secret", cloudinary.apiSecret());
        // Always deliver assets over HTTPS.
        config.put("secure", "true");
        return new Cloudinary(config);
    }
}
