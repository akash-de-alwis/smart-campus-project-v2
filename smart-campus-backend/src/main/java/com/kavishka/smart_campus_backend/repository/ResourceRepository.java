package com.kavishka.smart_campus_backend.repository;

import com.kavishka.smart_campus_backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}