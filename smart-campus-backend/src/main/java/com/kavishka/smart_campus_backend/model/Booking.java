package com.kavishka.smart_campus_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    @Positive(message = "Expected attendees must be positive")
    private int expectedAttendees;
    
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED
    private String rejectionReason;
    private String approvedBy;
    private String qrCode; // Base64 encoded QR code for approved bookings
}