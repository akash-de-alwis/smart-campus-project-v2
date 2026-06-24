package com.kavishka.smart_campus_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "bmp", "webp", "pdf", "doc", "docx", "txt"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public String storeProfileImage(MultipartFile file, String userId) throws IOException {
        // Validate file (only images allowed for profile)
        validateImageFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "profiles", userId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Delete existing profile images for this user
        if (Files.exists(uploadPath)) {
            Files.list(uploadPath).forEach(existingFile -> {
                try {
                    Files.delete(existingFile);
                } catch (IOException e) {
                    // Log but don't fail if we can't delete old file
                }
            });
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = "profile." + extension;

        // Store file
        Path targetLocation = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path for storage in database
        return "profiles/" + userId + "/" + newFilename;
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String extension = getFileExtension(originalFilename);
        List<String> allowedImageExtensions = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
        if (!allowedImageExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Only image files are allowed. Allowed types: " + String.join(", ", allowedImageExtensions));
        }
    }

    public String storeFile(MultipartFile file, String ticketId) throws IOException {
        // Validate file
        validateFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "tickets", ticketId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + "." + extension;

        // Store file
        Path targetLocation = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path for storage in database
        return "tickets/" + ticketId + "/" + newFilename;
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    public Path getUploadDir() {
        return Paths.get(uploadDir);
    }
}
