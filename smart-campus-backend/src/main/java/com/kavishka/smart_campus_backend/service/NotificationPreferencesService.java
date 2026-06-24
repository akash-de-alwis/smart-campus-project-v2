package com.kavishka.smart_campus_backend.service;

import com.kavishka.smart_campus_backend.model.NotificationPreferences;
import com.kavishka.smart_campus_backend.repository.NotificationPreferencesRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class NotificationPreferencesService {
    private final NotificationPreferencesRepository repository;

    public NotificationPreferencesService(NotificationPreferencesRepository repository) {
        this.repository = repository;
    }

    public NotificationPreferences getOrCreatePreferences(String userId) {
        Optional<NotificationPreferences> existing = repository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create default preferences for new user
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.setUserId(userId);
        prefs.setUpdatedAt(Instant.now());
        return repository.save(prefs);
    }

    public Optional<NotificationPreferences> getPreferences(String userId) {
        return repository.findByUserId(userId);
    }

    public NotificationPreferences updatePreferences(String userId, NotificationPreferences updates) {
        NotificationPreferences prefs = getOrCreatePreferences(userId);

        // Update only the provided fields
        if (updates.isBookingUpdates() != prefs.isBookingUpdates()) {
            prefs.setBookingUpdates(updates.isBookingUpdates());
        }
        if (updates.isTicketUpdates() != prefs.isTicketUpdates()) {
            prefs.setTicketUpdates(updates.isTicketUpdates());
        }
        if (updates.isSystemAnnouncements() != prefs.isSystemAnnouncements()) {
            prefs.setSystemAnnouncements(updates.isSystemAnnouncements());
        }
        if (updates.isResourceUpdates() != prefs.isResourceUpdates()) {
            prefs.setResourceUpdates(updates.isResourceUpdates());
        }
        if (updates.isMaintenanceAlerts() != prefs.isMaintenanceAlerts()) {
            prefs.setMaintenanceAlerts(updates.isMaintenanceAlerts());
        }
        if (updates.isEmailNotifications() != prefs.isEmailNotifications()) {
            prefs.setEmailNotifications(updates.isEmailNotifications());
        }
        if (updates.isPushNotifications() != prefs.isPushNotifications()) {
            prefs.setPushNotifications(updates.isPushNotifications());
        }

        prefs.setUpdatedAt(Instant.now());
        return repository.save(prefs);
    }

    public void deletePreferences(String userId) {
        repository.findByUserId(userId).ifPresent(repository::delete);
    }

    public boolean shouldSendNotification(String userId, String category) {
        Optional<NotificationPreferences> prefsOpt = repository.findByUserId(userId);
        if (prefsOpt.isEmpty()) {
            return true; // Default to sending if no preferences set
        }

        NotificationPreferences prefs = prefsOpt.get();

        // Check master switches first
        if (!prefs.isEmailNotifications() && !prefs.isPushNotifications()) {
            return false;
        }

        // Check category-specific preferences
        return switch (category.toUpperCase()) {
            case "BOOKING" -> prefs.isBookingUpdates();
            case "TICKET" -> prefs.isTicketUpdates();
            case "SYSTEM" -> prefs.isSystemAnnouncements();
            case "RESOURCE" -> prefs.isResourceUpdates();
            case "MAINTENANCE" -> prefs.isMaintenanceAlerts();
            default -> true;
        };
    }
}
