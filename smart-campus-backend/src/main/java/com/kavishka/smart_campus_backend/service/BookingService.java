package com.kavishka.smart_campus_backend.service;

import com.kavishka.smart_campus_backend.model.Booking;
import com.kavishka.smart_campus_backend.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository repository;
    private final NotificationService notificationService;
    private final QRCodeService qrCodeService;
    private final ResourceService resourceService;

    public BookingService(BookingRepository repository, NotificationService notificationService, QRCodeService qrCodeService, ResourceService resourceService) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
        this.resourceService = resourceService;
    }

    public Booking create(Booking booking, String userId) {
        booking.setUserId(userId);
        booking.setStatus("PENDING");
        
        // Check for conflicts and provide detailed error message
        String conflictInfo = getConflictInfo(booking);
        if (conflictInfo != null) {
            throw new RuntimeException(conflictInfo);
        }
        
        // Check capacity constraints
        String capacityError = validateCapacity(booking);
        if (capacityError != null) {
            throw new RuntimeException(capacityError);
        }
        
        if (resourceService.isOutOfService(booking.getResourceId())) throw new RuntimeException("Resource is out of service");
        return repository.save(booking);
    }

    public Booking update(String id, Booking booking, String userId) {
        Booking existing = repository.findById(id).orElseThrow();
        if (!existing.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the booking owner can update this booking");
        }
        if (!existing.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Can only update pending bookings");
        }
        booking.setId(id);
        booking.setUserId(userId);
        booking.setStatus("PENDING");
        
        // Check for conflicts and provide detailed error message
        String conflictInfo = getConflictInfo(booking);
        if (conflictInfo != null) {
            throw new RuntimeException(conflictInfo);
        }
        
        // Check capacity constraints
        String capacityError = validateCapacity(booking);
        if (capacityError != null) {
            throw new RuntimeException(capacityError);
        }
        
        if (resourceService.isOutOfService(booking.getResourceId())) throw new RuntimeException("Resource is out of service");
        return repository.save(booking);
    }

    private String getConflictInfo(Booking newBooking) {
        List<Booking> approved = repository.findByResourceIdAndStatus(newBooking.getResourceId(), "APPROVED");
        for (Booking existing : approved) {
            if (!(newBooking.getEndTime().isBefore(existing.getStartTime()) || 
                  newBooking.getStartTime().isAfter(existing.getEndTime()))) {
                return String.format(
                    "This resource is already booked during your requested time. " +
                    "Conflict from %s to %s on %s. " +
                    "Please choose a different time slot.",
                    existing.getStartTime().toLocalTime(),
                    existing.getEndTime().toLocalTime(),
                    existing.getStartTime().toLocalDate()
                );
            }
        }
        return null;
    }

    private String validateCapacity(Booking booking) {
        try {
            var resource = resourceService.getById(booking.getResourceId());
            if (booking.getExpectedAttendees() > resource.getCapacity()) {
                return String.format(
                    "Cannot book this resource. Expected attendees (%d) exceeds the maximum capacity of %s (%d people). " +
                    "Please reduce the number of attendees or choose a larger resource.",
                    booking.getExpectedAttendees(),
                    resource.getName(),
                    resource.getCapacity()
                );
            }
            return null;
        } catch (Exception e) {
            return "Resource not found. Please select a valid resource.";
        }
    }

    public Booking approve(String id, String adminId, String reason) {
        System.out.println("Approving booking: " + id + " by admin: " + adminId);
        
        Booking b = repository.findById(id).orElseThrow();
        b.setStatus("APPROVED");
        b.setApprovedBy(adminId);
        
        System.out.println("Generating QR code for approved booking...");
        // Generate QR code for approved booking
        String qrCode = qrCodeService.generateQRCodeForBooking(b);
        b.setQrCode(qrCode);
        
        System.out.println("QR code generated and set for booking: " + id);
        Booking saved = repository.save(b);
        notificationService.createNotification(b.getUserId(), "Your booking has been APPROVED. QR code generated for check-in.", id);
        
        System.out.println("Booking approved and saved with QR code: " + saved.getId());
        return saved;
    }

    public Booking reject(String id, String adminId, String reason) {
        Booking b = repository.findById(id).orElseThrow();
        b.setStatus("REJECTED");
        b.setRejectionReason(reason);
        Booking saved = repository.save(b);
        notificationService.createNotification(b.getUserId(), "Your booking has been REJECTED: " + reason, id);
        return saved;
    }

    public List<Booking> getUserBookings(String userId) { return repository.findByUserId(userId); }
    
    public Booking getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
    }
    
    public Booking cancel(String id, String userId, String reason) {
        Booking b = repository.findById(id).orElseThrow();
        if (!b.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the booking owner can cancel");
        }
        b.setStatus("CANCELLED");
        b.setRejectionReason(reason);
        Booking saved = repository.save(b);
        notificationService.createNotification(b.getUserId(), "Your booking has been cancelled");
        return saved;
    }
    
    public List<Booking> getAll() { return repository.findAll(); }
}