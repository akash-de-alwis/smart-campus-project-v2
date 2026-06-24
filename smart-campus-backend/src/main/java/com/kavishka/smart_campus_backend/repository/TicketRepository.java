package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId);
}