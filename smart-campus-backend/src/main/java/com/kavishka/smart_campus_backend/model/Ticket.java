package com.kavishka.smart_campus_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    private String resourceId;
    private String userId;
    private String title;
    private String description;
    private String category;
    private String priority = "MEDIUM";
    private String department;
    private String location;
    private String contactDetails;
    private Integer affectedUsers = 1;
    private String status = "OPEN";
    private String assignedTo;
    private String resolutionNotes;
    private List<Comment> comments = new ArrayList<>();
    private List<String> attachments = new ArrayList<>(); // Store file paths/URLs
    private LocalDateTime createdAt = LocalDateTime.now();
}