package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.NotificationPreferences;
import com.kavishka.smart_campus_backend.service.NotificationPreferencesService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferencesController {

    private final NotificationPreferencesService service;

    public NotificationPreferencesController(NotificationPreferencesService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<NotificationPreferences> getPreferences(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        NotificationPreferences prefs = service.getOrCreatePreferences(userId);
        return ResponseEntity.ok(prefs);
    }

    @PutMapping
    public ResponseEntity<NotificationPreferences> updatePreferences(
            @RequestBody NotificationPreferences updates,
            @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        NotificationPreferences prefs = service.updatePreferences(userId, updates);
        return ResponseEntity.ok(prefs);
    }

    @PatchMapping
    public ResponseEntity<NotificationPreferences> patchPreferences(
            @RequestBody Map<String, Boolean> updates,
            @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        NotificationPreferences prefs = service.getOrCreatePreferences(userId);

        // Apply partial updates
        updates.forEach((key, value) -> {
            switch (key) {
                case "bookingUpdates" -> prefs.setBookingUpdates(value);
                case "ticketUpdates" -> prefs.setTicketUpdates(value);
                case "systemAnnouncements" -> prefs.setSystemAnnouncements(value);
                case "resourceUpdates" -> prefs.setResourceUpdates(value);
                case "maintenanceAlerts" -> prefs.setMaintenanceAlerts(value);
                case "emailNotifications" -> prefs.setEmailNotifications(value);
                case "pushNotifications" -> prefs.setPushNotifications(value);
            }
        });

        NotificationPreferences updated = service.updatePreferences(userId, prefs);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping
    public ResponseEntity<Void> resetPreferences(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        service.deletePreferences(userId);
        return ResponseEntity.noContent().build();
    }
}
