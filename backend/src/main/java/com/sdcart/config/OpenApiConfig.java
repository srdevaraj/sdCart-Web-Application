package com.sdcart.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI sdCartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("sdCart API")
                        .description("REST API for the sdCart e-commerce platform. "
                                + "Public catalog endpoints are open; customer and admin endpoints "
                                + "require a Bearer access token (obtained via /api/v1/auth/login).")
                        .version("1.0.0")
                        .contact(new Contact().name("sdCart Team").email("dev@sdcart.com"))
                        .license(new License().name("Proprietary")))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME));
    }
}
