package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.NotificationPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NotificationPreferencesRepository extends MongoRepository<NotificationPreferences, String> {
    Optional<NotificationPreferences> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
