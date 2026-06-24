package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.Notification;
import com.kavishka.smart_campus_backend.service.NotificationService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> getMy(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.getUserNotifications(userId);
    }

    @GetMapping("/unread")
    public List<Notification> getUnread(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.getUnreadNotifications(userId);
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id, @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return service.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        service.delete(id);
    }
}