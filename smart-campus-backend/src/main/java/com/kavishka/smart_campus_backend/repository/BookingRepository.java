package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceIdAndStatus(String resourceId, String status);
    List<Booking> findByStatus(String status);
}