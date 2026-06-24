package com.kavishka.smart_campus_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService, CorsConfigurationSource corsConfigurationSource) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/files/profiles/**").permitAll()
                        .requestMatchers("/api/users/profile", "/api/users/profile/**").authenticated()
                        .requestMatchers("/api/tickets/my").authenticated()
                        .requestMatchers("/api/tickets/{id}").authenticated()
                        .requestMatchers("/api/tickets/{id}/comments").authenticated()
                        .requestMatchers("/api/tickets/{ticketId}/comments/{commentId}").authenticated()
                        .requestMatchers("/api/tickets").authenticated()
                        .requestMatchers("/api/tickets/**").hasAnyRole("ADMIN", "TECHNICIAN")
                        .requestMatchers("/api/admin/**", "/api/users/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(customOAuth2UserService)   // ← Only this line (Google = OIDC)
                        )
                        .defaultSuccessUrl("http://localhost:5173/dashboard", true)
                )
                .logout(logout -> logout.logoutSuccessUrl("http://localhost:5173/login"));

        return http.build();
    }
}