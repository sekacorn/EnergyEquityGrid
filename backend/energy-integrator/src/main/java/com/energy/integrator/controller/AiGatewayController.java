package com.energy.integrator.controller;

import com.energy.integrator.service.AiGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiGatewayController {

    @Autowired
    private AiGatewayService aiGatewayService;

    @PostMapping("/predict")
    public ResponseEntity<String> predict(@RequestBody Map<String, Object> payload) {
        return aiGatewayService.predict(payload);
    }

    @PostMapping("/query")
    public ResponseEntity<String> query(@RequestBody Map<String, Object> payload) {
        return aiGatewayService.query(payload);
    }

    @PostMapping("/troubleshoot")
    public ResponseEntity<String> troubleshoot(@RequestBody Map<String, Object> payload) {
        return aiGatewayService.troubleshoot(payload);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "ai-gateway"));
    }
}
