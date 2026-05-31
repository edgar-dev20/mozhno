package ru.mozhno.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Feature Flags API")
                        .description("API for managing feature flags with strategies: SERVER, GRADUAL, MIXED")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Feature Flags Team")))
                .addSecurityItem(new SecurityRequirement().addList("ApiKeyAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("ApiKeyAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")
                                .description("API key for client authentication")));
    }
}