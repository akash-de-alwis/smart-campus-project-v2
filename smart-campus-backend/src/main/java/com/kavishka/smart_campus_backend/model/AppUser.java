package com.kavishka.smart_campus_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class AppUser {
    @Id
    private String id; // email
    private String email;
    private String name;
    private String phone;
    private String department;
    private String building;
    private String googleSub;
    private String role = "USER"; // USER, ADMIN, TECHNICIAN
    private String profileImage; // URL/path to profile image
}