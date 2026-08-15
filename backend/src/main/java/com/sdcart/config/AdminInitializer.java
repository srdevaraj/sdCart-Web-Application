package com.sdcart.config;

import com.sdcart.user.RoleName;
import com.sdcart.user.RoleRepository;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;

/**
 * Creates the initial administrator account on startup — but only when
 * {@code ADMIN_PASSWORD} is explicitly provided. In local development the
 * default (dev profile) is {@code password}; in production no default exists,
 * so the admin is never silently bootstrapped with a weak credential.
 */
@Slf4j
@Component
public class AdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    public AdminInitializer(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            AppProperties appProperties) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.appProperties = appProperties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String adminEmail = appProperties.admin().email();
        String adminPassword = appProperties.admin().password();
        if (!StringUtils.hasText(adminPassword)) {
            log.debug("ADMIN_PASSWORD not set — skipping admin bootstrap");
            return;
        }
        String email = adminEmail.toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            return;
        }
        roleRepository.findByName(RoleName.ADMIN).ifPresentOrElse(adminRole -> {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email(email)
                    .password(passwordEncoder.encode(adminPassword))
                    .active(true)
                    .build();
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
            log.info("Bootstrapped admin user {}", email);
        }, () -> log.warn("ADMIN role not found — admin bootstrap skipped (run Flyway migrations first)"));
    }
}
