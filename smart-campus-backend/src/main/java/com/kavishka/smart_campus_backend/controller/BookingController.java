package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.Booking;
import com.kavishka.smart_campus_backend.service.BookingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking, @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.create(booking, userId);
    }

    @PutMapping("/{id}")
    public Booking update(@PathVariable String id, @Valid @RequestBody Booking booking, @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.update(id, booking, userId);
    }

    @GetMapping("/my")
    public List<Booking> myBookings(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.getUserBookings(userId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking approve(@PathVariable String id,
                           @RequestBody Map<String, String> body,
                           @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String adminId = principal.getEmail();
        String reason = body.get("reason");
        return service.approve(id, adminId, reason);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking reject(@PathVariable String id,
                          @RequestBody Map<String, String> body,
                          @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String adminId = principal.getEmail();
        String reason = body.get("reason");
        return service.reject(id, adminId, reason);
    }

    @PatchMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestBody Map<String, String> body,
                          @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        String reason = body.get("reason");
        return service.cancel(id, userId, reason);
    }
}