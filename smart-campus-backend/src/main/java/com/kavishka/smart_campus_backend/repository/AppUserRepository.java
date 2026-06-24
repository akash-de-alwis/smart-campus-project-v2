package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.AppUser;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AppUserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
}