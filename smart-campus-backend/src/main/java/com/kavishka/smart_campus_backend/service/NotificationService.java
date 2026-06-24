package com.kavishka.smart_campus_backend.service;

import com.kavishka.smart_campus_backend.model.Notification;
import com.kavishka.smart_campus_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public void createNotification(String userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        repository.save(n);
    }

    public void createNotification(String userId, String message, String relatedId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setRelatedId(relatedId);
        repository.save(n);
    }

    public List<Notification> getUserNotifications(String userId) {
        return repository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return repository.findByUserIdAndIsRead(userId, false);
    }

    public Notification markAsRead(String id) {
        Notification n = repository.findById(id).orElseThrow();
        n.setRead(true);
        return repository.save(n);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}