package com.kavishka.smart_campus_backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;
    @NotBlank
    private String name;
    @NotBlank
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    @Min(1)
    private int capacity;
    @NotBlank
    private String location;
    private String availabilityWindows;
    private String status = "ACTIVE"; // ACTIVE, OUT_OF_SERVICE
}