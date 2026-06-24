package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/profiles/{userId}/{filename:.+}")
    public ResponseEntity<Resource> serveProfileImage(
            @PathVariable String userId,
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get(fileStorageService.getUploadDir().toString(), "profiles", userId, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (Exception e) {
                    // Use default content type
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/tickets/{ticketId}/{filename:.+}")
    public ResponseEntity<Resource> serveTicketFile(
            @PathVariable String ticketId,
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get(fileStorageService.getUploadDir().toString(), "tickets", ticketId, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (Exception e) {
                    // Use default content type
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/attachments/**")
    public ResponseEntity<Resource> serveAttachment(@RequestParam String path) {
        try {
            Path filePath = Paths.get(fileStorageService.getUploadDir().toString(), path);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (Exception e) {
                    // Use default content type
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
