package com.kavishka.smart_campus_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String id = java.util.UUID.randomUUID().toString();
    private String userId;
    private String text;
    private LocalDateTime timestamp = LocalDateTime.now();
}