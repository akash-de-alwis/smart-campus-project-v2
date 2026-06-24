package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.Resource;
import com.kavishka.smart_campus_backend.service.ResourceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    private final ResourceService service;

    public ResourceController(ResourceService service) { this.service = service; }

    @GetMapping
    public List<Resource> search(@RequestParam(required = false) String type,
                                 @RequestParam(required = false) Integer capacity,
                                 @RequestParam(required = false) String location) {
        return service.search(type, capacity, location);
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource create(@RequestBody Resource resource) { return service.create(resource); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) { service.delete(id); }
}