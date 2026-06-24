package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
    List<Notification> findByUserIdAndIsRead(String userId, boolean isRead);
}