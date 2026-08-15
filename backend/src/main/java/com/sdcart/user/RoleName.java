package com.sdcart.user;

/**
 * Application roles. Stored as plain names in the database; the Spring
 * Security authority is derived with the standard {@code ROLE_} prefix.
 */
public enum RoleName {
    ADMIN,
    USER;

    public String authority() {
        return "ROLE_" + name();
    }
}
