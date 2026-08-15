package com.sdcart.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlugUtilsTest {

    @Test
    void slugify_lowercasesAndStripsSpecialChars() {
        assertThat(SlugUtils.slugify("Wireless Headphones!")).isEqualTo("wireless-headphones");
        assertThat(SlugUtils.slugify("  4K  Ultra  TV   ")).isEqualTo("4k-ultra-tv");
    }

    @Test
    void uniqueSlug_prefersProvidedSlug() {
        assertThat(SlugUtils.uniqueSlug("my-slug", "Fallback Name")).isEqualTo("my-slug");
    }

    @Test
    void uniqueSlug_fallsBackToName() {
        assertThat(SlugUtils.uniqueSlug(null, "Classic Cotton T-Shirt")).isEqualTo("classic-cotton-t-shirt");
    }

    @Test
    void uniqueSlug_neverReturnsBlank() {
        assertThat(SlugUtils.uniqueSlug("!!!", "???")).startsWith("item-");
    }
}
