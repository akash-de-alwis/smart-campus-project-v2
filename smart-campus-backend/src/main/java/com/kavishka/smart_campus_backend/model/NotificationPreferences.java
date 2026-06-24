package com.kavishka.smart_campus_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_preferences")
public class NotificationPreferences {
    @Id
    private String id;
    private String userId; // email

    // Notification categories
    private boolean bookingUpdates = true;      // Booking confirmations, approvals, rejections
    private boolean ticketUpdates = true;       // Ticket status changes, new comments
    private boolean systemAnnouncements = true; // System-wide announcements
    private boolean resourceUpdates = true;     // Resource availability changes
    private boolean maintenanceAlerts = true;   // Maintenance notifications
    private boolean emailNotifications = true;  // Enable/disable all email notifications
    private boolean pushNotifications = true;   // Enable/disable all push notifications

    private Instant updatedAt;
}
