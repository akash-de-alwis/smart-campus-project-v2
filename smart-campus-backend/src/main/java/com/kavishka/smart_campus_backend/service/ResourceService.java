package com.kavishka.smart_campus_backend.service;

import com.kavishka.smart_campus_backend.model.Resource;
import com.kavishka.smart_campus_backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAll() { return repository.findAll(); }

    public Resource getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with id: " + id));
    }

    public Resource create(Resource resource) { return repository.save(resource); }

    public Resource update(String id, Resource resource) {
        resource.setId(id);
        return repository.save(resource);
    }

    public boolean isOutOfService(String resourceId) {
        Resource resource = repository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with id: " + resourceId));
        return "OUT_OF_SERVICE".equals(resource.getStatus());
    }

    public void delete(String id) { repository.deleteById(id); }

    public List<Resource> search(String type, Integer capacity, String location) {
        return repository.findAll().stream()
                .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
                .filter(r -> location == null || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .toList();
    }
}