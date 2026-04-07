package com.energy.integrator.controller;

import com.energy.integrator.service.CollaborationRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {

    @Autowired
    private CollaborationRoomService collaborationRoomService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "collaboration"));
    }

    @GetMapping("/rooms/{room}")
    public ResponseEntity<Map<String, Object>> getRoomState(@PathVariable String room) {
        return ResponseEntity.ok(collaborationRoomService.getRoomState(room));
    }
}
