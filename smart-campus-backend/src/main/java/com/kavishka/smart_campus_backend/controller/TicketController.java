package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.Ticket;
import com.kavishka.smart_campus_backend.service.TicketService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Ticket create(@RequestParam("ticket") String ticketJson,
                         @RequestParam(value = "images", required = false) MultipartFile[] images,
                         @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        try {
            Ticket ticket = Jackson2ObjectMapperBuilder.json().build().readValue(ticketJson, Ticket.class);
            String userId = principal.getEmail();
            return service.create(ticket, userId, images);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse ticket data", e);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Ticket updateStatus(@PathVariable String id,
                               @RequestBody Map<String, String> body,
                               @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.updateStatus(id, body.get("status"), body.get("notes"), userId);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public Ticket assignTechnician(@PathVariable String id,
                                    @RequestParam String technicianEmail) {
        return service.assignTechnician(id, technicianEmail);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public Ticket addComment(@PathVariable String id,
                             @RequestBody Map<String, String> body,
                             @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.addComment(id, body.get("text"), userId);
    }

    @GetMapping("/my")
    public List<Ticket> myTickets(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.getUserTickets(userId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Ticket getById(@PathVariable String id, @AuthenticationPrincipal OidcUser principal) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public List<Ticket> all() {
        return service.getAll();
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public Ticket deleteComment(@PathVariable String ticketId,
                                 @PathVariable String commentId,
                                 @AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String userId = principal.getEmail();
        return service.deleteComment(ticketId, commentId, userId);
    }
}