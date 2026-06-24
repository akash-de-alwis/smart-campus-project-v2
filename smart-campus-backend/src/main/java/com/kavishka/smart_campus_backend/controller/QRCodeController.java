package com.kavishka.smart_campus_backend.controller;

import com.kavishka.smart_campus_backend.model.Booking;
import com.kavishka.smart_campus_backend.service.BookingService;
import com.kavishka.smart_campus_backend.service.QRCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/qrcode")
@PreAuthorize("hasRole('ADMIN')")
public class QRCodeController {

    private final BookingService bookingService;
    private final QRCodeService qrCodeService;

    public QRCodeController(BookingService bookingService, QRCodeService qrCodeService) {
        this.bookingService = bookingService;
        this.qrCodeService = qrCodeService;
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyQRCode(@RequestBody Map<String, String> request) {
        String qrContent = request.get("qrContent");
        
        if (qrContent == null || qrContent.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "QR code content is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Parse QR content to extract booking ID
            String[] parts = qrContent.split(":");
            if (parts.length != 4 || !"SMART_CAMPUS_BOOKING".equals(parts[0])) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Invalid QR code format");
                return ResponseEntity.badRequest().body(response);
            }

            String bookingId = parts[1];
            Booking booking = bookingService.getById(bookingId);

            // Validate QR code content
            boolean isValid = qrCodeService.validateQRCodeContent(qrContent, booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            
            if (isValid) {
                response.put("booking", booking);
                response.put("message", "QR code verified successfully");
            } else {
                response.put("message", "QR code validation failed");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Booking not found: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Error verifying QR code: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-by-id")
    public ResponseEntity<Map<String, Object>> verifyBookingById(@RequestBody Map<String, String> request) {
        String bookingId = request.get("bookingId");
        
        if (bookingId == null || bookingId.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Booking ID is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            Booking booking = bookingService.getById(bookingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("booking", booking);
            response.put("message", "Booking found successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Booking not found: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Error finding booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
