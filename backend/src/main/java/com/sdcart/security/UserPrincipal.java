package com.sdcart.security;

import com.sdcart.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Authenticated principal stored in the {@code SecurityContext}.
 * Never exposes the password hash to serialization (not a bean).
 */
public record UserPrincipal(
        Long id,
        String email,
        String password,
        boolean active,
        Collection<? extends GrantedAuthority> authorities) implements UserDetails {

    public static UserPrincipal from(User user) {
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().authority()))
                .toList();
        return new UserPrincipal(user.getId(), user.getEmail(), user.getPassword(), user.isActive(), authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
