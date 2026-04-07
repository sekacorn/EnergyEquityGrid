package com.energy.session.controller;

import com.energy.session.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String consentStr = request.get("consentDataProcessing");

        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "username, email, and password are required"
            ));
        }

        boolean consent = "true".equalsIgnoreCase(consentStr);
        Map<String, Object> response = authenticationService.registerUser(username, email, password, consent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "username and password are required"
            ));
        }

        Map<String, Object> response = authenticationService.login(username, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sso/login")
    public ResponseEntity<Map<String, Object>> ssoLogin(@RequestBody Map<String, String> request) {
        String ssoProvider = request.get("ssoProvider");
        String ssoUserId = request.get("ssoUserId");
        String email = request.get("email");
        String name = request.get("name");

        if (ssoProvider == null || ssoUserId == null || email == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "ssoProvider, ssoUserId, email, and name are required"
            ));
        }

        Map<String, Object> response = authenticationService.loginWithSso(ssoProvider, ssoUserId, email, name);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<Map<String, Object>> enableMfa(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        if (userIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId is required"
            ));
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            Map<String, Object> response = authenticationService.enableMfa(userId);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId must be a valid number"
            ));
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<Map<String, Object>> verifyMfa(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        String codeStr = request.get("code");

        if (userIdStr == null || codeStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and code are required"
            ));
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            int code = Integer.parseInt(codeStr);
            Map<String, Object> response = authenticationService.verifyMfa(userId, code);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and code must be valid numbers"
            ));
        }
    }

    @PostMapping("/promote/moderator")
    public ResponseEntity<Map<String, Object>> promoteToModerator(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        String adminIdStr = request.get("adminId");

        if (userIdStr == null || adminIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and adminId are required"
            ));
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            Long adminId = Long.parseLong(adminIdStr);
            Map<String, Object> response = authenticationService.promoteToModerator(userId, adminId);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and adminId must be valid numbers"
            ));
        }
    }

    @PostMapping("/promote/admin")
    public ResponseEntity<Map<String, Object>> promoteToAdmin(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        String adminIdStr = request.get("adminId");

        if (userIdStr == null || adminIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and adminId are required"
            ));
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            Long adminId = Long.parseLong(adminIdStr);
            Map<String, Object> response = authenticationService.promoteToAdmin(userId, adminId);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "userId and adminId must be valid numbers"
            ));
        }
    }

    // ─── GDPR Endpoints ────────────────────────────────────────────────────

    /**
     * GDPR Article 15: Right of access — returns all personal data held for the user.
     */
    @GetMapping("/gdpr/access/{userId}")
    public ResponseEntity<Map<String, Object>> gdprAccess(@PathVariable Long userId) {
        Map<String, Object> response = authenticationService.getUserData(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * GDPR Article 20: Right to data portability — exports user data as JSON.
     */
    @GetMapping("/gdpr/export/{userId}")
    public ResponseEntity<Map<String, Object>> gdprExport(@PathVariable Long userId) {
        Map<String, Object> response = authenticationService.exportUserData(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * GDPR Article 17: Right to erasure — initiates a 30-day deletion request.
     */
    @PostMapping("/gdpr/delete/{userId}")
    public ResponseEntity<Map<String, Object>> gdprDelete(@PathVariable Long userId) {
        Map<String, Object> response = authenticationService.requestDataDeletion(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * GDPR Article 7: Update consent preferences.
     * Body: { "consentType": "data_processing|marketing|analytics|privacy_policy", "granted": true/false }
     */
    @PostMapping("/gdpr/consent/{userId}")
    public ResponseEntity<Map<String, Object>> gdprConsent(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String consentType = request.get("consentType");
        String grantedStr = request.get("granted");

        if (consentType == null || grantedStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "consentType and granted are required"
            ));
        }

        boolean granted = "true".equalsIgnoreCase(grantedStr);
        Map<String, Object> response = authenticationService.updateConsent(userId, consentType, granted);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-session"));
    }
}
