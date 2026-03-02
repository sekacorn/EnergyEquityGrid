package com.energy.session.controller;

import com.energy.session.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String mbtiType = request.getOrDefault("mbtiType", "UNKNOWN");

        Map<String, Object> response = authenticationService.registerUser(username, email, password, mbtiType);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response = authenticationService.login(username, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sso/login")
    public ResponseEntity<Map<String, Object>> ssoLogin(@RequestBody Map<String, String> request) {
        String ssoProvider = request.get("ssoProvider");
        String ssoUserId = request.get("ssoUserId");
        String email = request.get("email");
        String name = request.get("name");

        Map<String, Object> response = authenticationService.loginWithSso(ssoProvider, ssoUserId, email, name);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<Map<String, Object>> enableMfa(@RequestBody Map<String, String> request) {
        Long userId = Long.parseLong(request.get("userId"));
        Map<String, Object> response = authenticationService.enableMfa(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<Map<String, Object>> verifyMfa(@RequestBody Map<String, String> request) {
        Long userId = Long.parseLong(request.get("userId"));
        int code = Integer.parseInt(request.get("code"));

        Map<String, Object> response = authenticationService.verifyMfa(userId, code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/promote/moderator")
    public ResponseEntity<Map<String, Object>> promoteToModerator(@RequestBody Map<String, String> request) {
        Long userId = Long.parseLong(request.get("userId"));
        Long adminId = Long.parseLong(request.get("adminId"));

        Map<String, Object> response = authenticationService.promoteToModerator(userId, adminId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/promote/admin")
    public ResponseEntity<Map<String, Object>> promoteToAdmin(@RequestBody Map<String, String> request) {
        Long userId = Long.parseLong(request.get("userId"));
        Long adminId = Long.parseLong(request.get("adminId"));

        Map<String, Object> response = authenticationService.promoteToAdmin(userId, adminId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-session"));
    }
}
