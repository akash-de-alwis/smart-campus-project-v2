package com.kavishka.smart_campus_backend.service;

import com.kavishka.smart_campus_backend.model.Comment;
import com.kavishka.smart_campus_backend.model.Ticket;
import com.kavishka.smart_campus_backend.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;

@Service
public class TicketService {
    private final TicketRepository repository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public TicketService(TicketRepository repository, NotificationService notificationService, FileStorageService fileStorageService) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    public Ticket create(Ticket ticket, String userId) {
        ticket.setUserId(userId);
        return repository.save(ticket);
    }

    public Ticket create(Ticket ticket, String userId, MultipartFile[] images) {
        ticket.setUserId(userId);
        
        // Handle file attachments
        if (images != null && images.length > 0) {
            String ticketId = repository.save(ticket).getId();
            
            for (MultipartFile file : images) {
                try {
                    String filePath = fileStorageService.storeFile(file, ticketId);
                    ticket.getAttachments().add(filePath);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
                }
            }
            
            return repository.save(ticket);
        }
        
        return repository.save(ticket);
    }

    public Ticket updateStatus(String id, String status, String notes, String userId) {
        Ticket t = repository.findById(id).orElseThrow();
        String oldStatus = t.getStatus();
        t.setStatus(status);
        t.setResolutionNotes(notes);
        Ticket saved = repository.save(t);
        
        // Create detailed notification for status change
        String notificationMessage = String.format(
            "Your ticket #%s status has been updated from %s to %s", 
            t.getId().substring(0, 8),
            oldStatus,
            status
        );
        
        if (notes != null && !notes.trim().isEmpty()) {
            notificationMessage += ". Notes: " + notes;
        }
        
        notificationService.createNotification(t.getUserId(), notificationMessage, t.getId());
        return saved;
    }

    public Ticket addComment(String ticketId, String text, String userId) {
        Ticket t = repository.findById(ticketId).orElseThrow();
        Comment c = new Comment();
        c.setUserId(userId);
        c.setText(text);
        t.getComments().add(c);
        Ticket saved = repository.save(t);
        
        // Create detailed notification for new comment
        String notificationMessage = String.format(
            "New comment on your ticket #%s: %s", 
            t.getId().substring(0, 8),
            text.length() > 50 ? text.substring(0, 50) + "..." : text
        );
        
        // Only notify if the commenter is not the ticket owner
        if (!userId.equals(t.getUserId())) {
            notificationService.createNotification(t.getUserId(), notificationMessage, t.getId());
        }
        
        return saved;
    }

    public List<Ticket> getUserTickets(String userId) { return repository.findByUserId(userId); }
    
    public Ticket getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with id: " + id));
    }
    
    public List<Ticket> getAll() { return repository.findAll(); }

    public Ticket assignTechnician(String ticketId, String technicianEmail) {
        Ticket t = repository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        t.setAssignedTo(technicianEmail);
        Ticket saved = repository.save(t);
        
        // Notify ticket owner about technician assignment
        String notificationMessage = String.format(
            "Your ticket #%s has been assigned to %s", 
            t.getId().substring(0, 8),
            technicianEmail
        );
        
        notificationService.createNotification(t.getUserId(), notificationMessage, t.getId());
        
        return saved;
    }

    public Ticket deleteComment(String ticketId, String commentId, String userId) {
        Ticket t = repository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        Comment comment = t.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        // Only comment owner or ticket creator can delete
        if (!comment.getUserId().equals(userId) && !t.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments");
        }
        
        t.getComments().remove(comment);
        return repository.save(t);
    }
}