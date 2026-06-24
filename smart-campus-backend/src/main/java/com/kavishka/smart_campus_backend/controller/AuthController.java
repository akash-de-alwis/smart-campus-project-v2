package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.AppUser;
import com.kavishka.smart_campus_backend.repository.AppUserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository repository;

    public AuthController(AppUserRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        // Fetch user from database to get profileImage and role
        AppUser appUser = repository.findByEmail(principal.getEmail()).orElse(null);

        Map<String, Object> map = new HashMap<>();
        map.put("email", principal.getEmail());
        map.put("name", principal.getFullName());
        map.put("authorities", principal.getAuthorities());
        map.put("profileImage", appUser != null ? appUser.getProfileImage() : null);
        map.put("role", appUser != null ? appUser.getRole() : "USER");
        return map;
    }
}