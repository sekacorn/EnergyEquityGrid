package com.energy.integrator.controller;

import com.energy.integrator.service.DataIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/data")
public class DataIntegrationController {

    @Autowired
    private DataIntegrationService dataIntegrationService;

    @PostMapping("/upload/energy")
    public ResponseEntity<Map<String, Object>> uploadEnergyData(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "anonymous";
            Map<String, Object> response = dataIntegrationService.uploadEnergyData(file, username);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error processing file: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/community")
    public ResponseEntity<Map<String, Object>> uploadCommunityData(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "anonymous";
            Map<String, Object> response = dataIntegrationService.uploadCommunityData(file, username);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error processing file: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/infrastructure")
    public ResponseEntity<Map<String, Object>> uploadInfrastructureData(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "anonymous";
            Map<String, Object> response = dataIntegrationService.uploadInfrastructureData(file, username);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error processing file: " + e.getMessage()));
        }
    }

    @GetMapping("/integrated")
    public ResponseEntity<Map<String, Object>> getIntegratedData(
            @RequestParam @Min(-90) @Max(90) Double latitude,
            @RequestParam @Min(-180) @Max(180) Double longitude,
            @RequestParam(defaultValue = "50") @Min(1) @Max(500) Double radius) {
        Map<String, Object> data = dataIntegrationService.getIntegratedData(latitude, longitude, radius);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "energy-integrator"));
    }
}
