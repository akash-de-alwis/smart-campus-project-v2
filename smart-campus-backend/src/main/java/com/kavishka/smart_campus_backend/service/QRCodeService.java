package com.kavishka.smart_campus_backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.kavishka.smart_campus_backend.model.Booking;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class QRCodeService {

    public String generateQRCodeForBooking(Booking booking) {
        try {
            System.out.println("Generating QR code for booking: " + booking.getId());
            
            // Generate unique QR content
            String qrContent = String.format(
                "SMART_CAMPUS_BOOKING:%s:%s:%s:%s", 
                booking.getId(),
                booking.getUserId(),
                booking.getResourceId(),
                booking.getStartTime().format(DateTimeFormatter.ISO_DATE_TIME)
            );
            
            System.out.println("QR content: " + qrContent);
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 200, 200);
            
            // Convert to BufferedImage manually
            int width = bitMatrix.getWidth();
            int height = bitMatrix.getHeight();
            BufferedImage qrImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    qrImage.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF);
                }
            }
            
            // Convert to Base64
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            javax.imageio.ImageIO.write(qrImage, "PNG", outputStream);
            String base64Image = Base64.getEncoder().encodeToString(outputStream.toByteArray());
            
            String result = "data:image/png;base64," + base64Image;
            System.out.println("QR code generated successfully, length: " + result.length());
            return result;
        } catch (WriterException | IOException e) {
            System.err.println("Error generating QR code: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public boolean validateQRCodeContent(String qrContent, Booking booking) {
        if (qrContent == null || booking == null) {
            return false;
        }
        
        String expectedContent = String.format(
            "SMART_CAMPUS_BOOKING:%s:%s:%s:%s", 
            booking.getId(),
            booking.getUserId(),
            booking.getResourceId(),
            booking.getStartTime().format(DateTimeFormatter.ISO_DATE_TIME)
        );
        
        return qrContent.equals(expectedContent);
    }
}
