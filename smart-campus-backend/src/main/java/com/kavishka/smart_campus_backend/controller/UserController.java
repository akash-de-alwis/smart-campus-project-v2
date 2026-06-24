package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.AppUser;
import com.kavishka.smart_campus_backend.repository.AppUserRepository;
import com.kavishka.smart_campus_backend.service.FileStorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final AppUserRepository repository;
    private final FileStorageService fileStorageService;

    public UserController(AppUserRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppUser> getAll() { return repository.findAll(); }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getProfile(@AuthenticationPrincipal OidcUser principal) {
        try {
            if (principal == null) {
                throw new IllegalArgumentException("User not authenticated");
            }
            AppUser appUser = repository.findByEmail(principal.getEmail())
                    .orElse(null);
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("email", principal.getEmail());
            profile.put("name", principal.getFullName());
            profile.put("picture", principal.getPicture());
            profile.put("role", appUser != null ? appUser.getRole() : "USER");
            profile.put("phone", appUser != null ? appUser.getPhone() : null);
            profile.put("department", appUser != null ? appUser.getDepartment() : null);
            profile.put("building", appUser != null ? appUser.getBuilding() : null);
            profile.put("profileImage", appUser != null ? appUser.getProfileImage() : null);
            profile.put("authorities", principal.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .toList());
            return profile;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load user profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> updateProfile(@AuthenticationPrincipal OidcUser principal,
                                             @RequestBody Map<String, String> data) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        
        AppUser user = repository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Update user fields based on provided data
        if (data.containsKey("name")) {
            user.setName(data.get("name"));
        }
        if (data.containsKey("phone")) {
            user.setPhone(data.get("phone"));
        }
        if (data.containsKey("department")) {
            user.setDepartment(data.get("department"));
        }
        if (data.containsKey("building")) {
            user.setBuilding(data.get("building"));
        }
        
        // Save updated user to database
        AppUser savedUser = repository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("name", savedUser.getName());
        response.put("phone", savedUser.getPhone());
        response.put("department", savedUser.getDepartment());
        response.put("building", savedUser.getBuilding());
        response.put("role", savedUser.getRole());
        response.put("profileImage", savedUser.getProfileImage());
        response.put("message", "Profile updated successfully");
        
        return response;
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public AppUser updateRole(@PathVariable String id, @RequestParam String role) {
        // Validate role
        if (!role.matches("USER|ADMIN|TECHNICIAN")) {
            throw new IllegalArgumentException("Invalid role. Must be USER, ADMIN, or TECHNICIAN");
        }
        AppUser user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        return repository.save(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AppUser getUserById(@PathVariable String id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable String id) {
        repository.deleteById(id);
    }

    @PostMapping("/profile/image")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> uploadProfileImage(@AuthenticationPrincipal OidcUser principal,
                                                   @RequestParam("file") MultipartFile file) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        try {
            AppUser user = repository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Store the file and get the relative path
            String filePath = fileStorageService.storeProfileImage(file, user.getId());

            // Update user with profile image path
            user.setProfileImage(filePath);
            AppUser savedUser = repository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("profileImage", savedUser.getProfileImage());
            response.put("message", "Profile image uploaded successfully");
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }
    }
}