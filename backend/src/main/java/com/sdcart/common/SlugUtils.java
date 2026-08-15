package com.sdcart.common;

import java.util.Locale;
import java.util.UUID;

public final class SlugUtils {

    private SlugUtils() {
    }

    /**
     * Converts arbitrary text into a URL-safe slug, e.g. "Wireless Headphones!"
     * -> "wireless-headphones".
     */
    public static String slugify(String value) {
        return value.toLowerCase(Locale.ROOT).trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }

    public static String uniqueSlug(String slug, String fallback) {
        String base = (slug == null || slug.isBlank()) ? slugify(fallback) : slugify(slug);
        return base.isBlank() ? "item-" + UUID.randomUUID().toString().substring(0, 8) : base;
    }
}
