package com.energy.session.service;

import com.energy.session.model.*;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.*;
import java.util.List;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    // NIST SP 800-53 AC-7: Lock account after this many consecutive failures
    private static final int MAX_FAILED_ATTEMPTS = 5;
    // NIST SP 800-53 AC-7: Lockout duration in minutes
    private static final int LOCKOUT_DURATION_MINUTES = 30;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ConsentLogRepository consentLogRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private Long jwtRefreshExpiration;

    @Value("${mfa.issuer}")
    private String mfaIssuer;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    private void audit(String eventType, String username, String details, boolean success) {
        try {
            AuditLog entry = new AuditLog(eventType, username, null, null, details, success);
            auditLogRepository.save(entry);
        } catch (Exception e) {
            logger.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    public Map<String, Object> registerUser(String username, String email, String password) {
        return registerUser(username, email, password, false);
    }

    public Map<String, Object> registerUser(String username, String email, String password, boolean consentDataProcessing) {
        if (userRepository.existsByUsername(username)) {
            return Map.of("success", false, "message", "Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            return Map.of("success", false, "message", "Email already exists");
        }

        // GDPR Article 7: Consent to data processing is required at registration
        if (!consentDataProcessing) {
            return Map.of("success", false, "message", "Consent to data processing is required to create an account (GDPR Art. 7).");
        }

        User user = new User(username, email, passwordEncoder.encode(password));
        user.getRoles().add(Role.USER);
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setConsentDataProcessing(true);
        user.setConsentDataProcessingAt(LocalDateTime.now());
        user.setPrivacyPolicyAcceptedAt(LocalDateTime.now());
        userRepository.save(user);

        // Record consent grant
        consentLogRepository.save(new ConsentLog(user.getId(), "data_processing", true));
        consentLogRepository.save(new ConsentLog(user.getId(), "privacy_policy", true));

        audit("REGISTER", username, "New user registered with GDPR consent", true);

        return Map.of(
            "success", true,
            "message", "User registered successfully",
            "userId", user.getId()
        );
    }

    public Map<String, Object> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            audit("LOGIN", username, "Unknown username", false);
            return Map.of("success", false, "message", "Invalid credentials");
        }

        User user = userOpt.get();

        // NIST AC-7: Check if account is currently locked out
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            audit("LOGIN", username, "Account locked out", false);
            logger.warn("Login attempt for locked account: {}", username);
            return Map.of("success", false, "message", "Account is temporarily locked due to too many failed attempts. Try again later.");
        }

        // Clear expired lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isBefore(LocalDateTime.now())) {
            user.setLockoutUntil(null);
            user.setFailedLoginAttempts(0);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            // NIST AC-7: Increment failed attempts and lock if threshold exceeded
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountNonLocked(false);
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
                userRepository.save(user);
                audit("LOGIN", username, "Account locked after " + attempts + " failed attempts", false);
                logger.warn("Account locked due to {} failed login attempts: {}", attempts, username);
                return Map.of("success", false, "message", "Account is temporarily locked due to too many failed attempts. Try again later.");
            }

            userRepository.save(user);
            audit("LOGIN", username, "Invalid password (attempt " + attempts + "/" + MAX_FAILED_ATTEMPTS + ")", false);
            return Map.of("success", false, "message", "Invalid credentials");
        }

        if (!user.getEnabled()) {
            audit("LOGIN", username, "Account disabled", false);
            return Map.of("success", false, "message", "Account is disabled");
        }

        // NIST AC-7: Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        user.setAccountNonLocked(true);

        if (user.getMfaEnabled()) {
            userRepository.save(user);
            audit("LOGIN", username, "MFA required", true);
            return Map.of(
                "success", true,
                "requiresMfa", true,
                "userId", user.getId()
            );
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        audit("LOGIN", username, "Successful login", true);

        String token = generateToken(user);
        String refreshToken = generateRefreshToken(user);

        return Map.of(
            "success", true,
            "token", token,
            "refreshToken", refreshToken,
            "user", getUserInfo(user)
        );
    }

    public Map<String, Object> loginWithSso(String ssoProvider, String ssoUserId, String email, String name) {
        Optional<User> userOpt = userRepository.findBySsoProviderAndSsoUserId(ssoProvider, ssoUserId);

        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setUsername(name.replaceAll("\\s+", "").toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8));
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setSsoProvider(ssoProvider);
            user.setSsoUserId(ssoUserId);
            user.getRoles().add(Role.USER);
            user.setIsEnterpriseUser(true);
            userRepository.save(user);
        } else {
            user = userOpt.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }

        String token = generateToken(user);
        String refreshToken = generateRefreshToken(user);

        return Map.of(
            "success", true,
            "token", token,
            "refreshToken", refreshToken,
            "user", getUserInfo(user)
        );
    }

    public Map<String, Object> enableMfa(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        user.setMfaSecret(key.getKey());
        user.setMfaEnabled(true);
        userRepository.save(user);

        String qrCodeUrl = String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s",
            mfaIssuer,
            user.getUsername(),
            key.getKey(),
            mfaIssuer
        );

        return Map.of(
            "success", true,
            "secret", key.getKey(),
            "qrCodeUrl", qrCodeUrl
        );
    }

    public Map<String, Object> verifyMfa(Long userId, int code) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();

        if (!user.getMfaEnabled() || user.getMfaSecret() == null) {
            return Map.of("success", false, "message", "MFA not enabled");
        }

        boolean isValid = gAuth.authorize(user.getMfaSecret(), code);

        if (!isValid) {
            audit("MFA_VERIFY", user.getUsername(), "Invalid MFA code", false);
            return Map.of("success", false, "message", "Invalid MFA code");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        audit("MFA_VERIFY", user.getUsername(), "MFA verification successful", true);

        String token = generateToken(user);
        String refreshToken = generateRefreshToken(user);

        return Map.of(
            "success", true,
            "token", token,
            "refreshToken", refreshToken,
            "user", getUserInfo(user)
        );
    }

    public Map<String, Object> promoteToModerator(Long userId, Long adminId) {
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isEmpty() || !adminOpt.get().getRoles().contains(Role.ADMIN)) {
            return Map.of("success", false, "message", "Unauthorized");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        user.getRoles().add(Role.MODERATOR);
        userRepository.save(user);
        audit("ROLE_CHANGE", user.getUsername(), "Promoted to MODERATOR by admin " + adminId, true);

        return Map.of("success", true, "message", "User promoted to moderator");
    }

    public Map<String, Object> promoteToAdmin(Long userId, Long adminId) {
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isEmpty() || !adminOpt.get().getRoles().contains(Role.ADMIN)) {
            audit("ROLE_CHANGE", "unknown", "Unauthorized admin promotion attempt by " + adminId, false);
            return Map.of("success", false, "message", "Unauthorized");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        user.getRoles().add(Role.ADMIN);
        userRepository.save(user);
        audit("ROLE_CHANGE", user.getUsername(), "Promoted to ADMIN by admin " + adminId, true);

        return Map.of("success", true, "message", "User promoted to admin");
    }

    // ─── GDPR Article 15: Right of access ───────────────────────────────────
    public Map<String, Object> getUserData(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        audit("GDPR_ACCESS", user.getUsername(), "User data access request (Art. 15)", true);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("email", user.getEmail());
        data.put("roles", user.getRoles());
        data.put("organization", user.getOrganization());
        data.put("isEnterpriseUser", user.getIsEnterpriseUser());
        data.put("mfaEnabled", user.getMfaEnabled());
        data.put("ssoProvider", user.getSsoProvider());
        data.put("createdAt", user.getCreatedAt());
        data.put("lastLogin", user.getLastLogin());
        data.put("consentDataProcessing", user.getConsentDataProcessing());
        data.put("consentDataProcessingAt", user.getConsentDataProcessingAt());
        data.put("consentMarketing", user.getConsentMarketing());
        data.put("consentMarketingAt", user.getConsentMarketingAt());
        data.put("consentAnalytics", user.getConsentAnalytics());
        data.put("consentAnalyticsAt", user.getConsentAnalyticsAt());
        data.put("privacyPolicyAcceptedAt", user.getPrivacyPolicyAcceptedAt());

        List<Map<String, Object>> consentHistory = consentLogRepository
            .findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(c -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("consentType", c.getConsentType());
                entry.put("granted", c.getGranted());
                entry.put("createdAt", c.getCreatedAt());
                return entry;
            })
            .toList();

        data.put("consentHistory", consentHistory);

        return Map.of("success", true, "data", data);
    }

    // ─── GDPR Article 20: Right to data portability ──────────────────────────
    public Map<String, Object> exportUserData(Long userId) {
        Map<String, Object> accessResult = getUserData(userId);
        if (!(Boolean) accessResult.get("success")) {
            return accessResult;
        }

        Optional<User> userOpt = userRepository.findById(userId);
        User user = userOpt.get();
        audit("GDPR_EXPORT", user.getUsername(), "User data export request (Art. 20)", true);

        // The data is returned as JSON which satisfies the "structured, commonly used,
        // machine-readable format" requirement of Article 20.
        return Map.of(
            "success", true,
            "format", "application/json",
            "data", accessResult.get("data")
        );
    }

    // ─── GDPR Article 17: Right to erasure ───────────────────────────────────
    public Map<String, Object> requestDataDeletion(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        audit("GDPR_DELETION_REQUEST", user.getUsername(), "Data deletion requested (Art. 17)", true);

        // Mark deletion request timestamp — allows a grace period before hard deletion
        user.setDataDeletionRequestedAt(LocalDateTime.now());
        user.setEnabled(false);
        userRepository.save(user);

        // Immediately invalidate all sessions
        userSessionRepository.deleteByUserId(userId);

        return Map.of(
            "success", true,
            "message", "Your data deletion request has been received. Your account has been deactivated and will be permanently deleted within 30 days. Contact support to cancel this request."
        );
    }

    // ─── GDPR Article 17: Hard delete (called by scheduled job after grace period) ──
    public Map<String, Object> executeDataDeletion(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        String username = user.getUsername();

        // Delete sessions, consent log entries cascade via FK, then delete user
        userSessionRepository.deleteByUserId(userId);
        consentLogRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .forEach(c -> consentLogRepository.delete(c));
        userRepository.delete(user);

        audit("GDPR_DELETION_EXECUTED", username, "User data permanently deleted (Art. 17)", true);

        return Map.of("success", true, "message", "User data permanently deleted");
    }

    // ─── GDPR Article 7: Consent management ─────────────────────────────────
    public Map<String, Object> updateConsent(Long userId, String consentType, boolean granted) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        LocalDateTime now = LocalDateTime.now();

        switch (consentType) {
            case "data_processing" -> {
                user.setConsentDataProcessing(granted);
                user.setConsentDataProcessingAt(now);
            }
            case "marketing" -> {
                user.setConsentMarketing(granted);
                user.setConsentMarketingAt(now);
            }
            case "analytics" -> {
                user.setConsentAnalytics(granted);
                user.setConsentAnalyticsAt(now);
            }
            case "privacy_policy" -> {
                if (granted) {
                    user.setPrivacyPolicyAcceptedAt(now);
                }
            }
            default -> {
                return Map.of("success", false, "message", "Unknown consent type: " + consentType);
            }
        }

        userRepository.save(user);

        // Log consent change for Article 30 record-keeping
        ConsentLog log = new ConsentLog(userId, consentType, granted);
        consentLogRepository.save(log);

        audit("GDPR_CONSENT", user.getUsername(),
            "Consent " + (granted ? "granted" : "revoked") + " for " + consentType, true);

        return Map.of("success", true, "message", "Consent updated");
    }

    // ─── GDPR Article 5(1)(e): Data retention cleanup ───────────────────────
    public Map<String, Object> runRetentionCleanup() {
        LocalDateTime sessionCutoff = LocalDateTime.now().minusDays(90);
        int expiredSessions = userSessionRepository.deleteExpiredBefore(sessionCutoff);

        // Delete users who requested deletion more than 30 days ago
        LocalDateTime deletionCutoff = LocalDateTime.now().minusDays(30);
        List<User> pendingDeletions = userRepository.findAll().stream()
            .filter(u -> u.getDataDeletionRequestedAt() != null
                && u.getDataDeletionRequestedAt().isBefore(deletionCutoff))
            .toList();

        int deletedUsers = 0;
        for (User user : pendingDeletions) {
            executeDataDeletion(user.getId());
            deletedUsers++;
        }

        audit("GDPR_RETENTION", "system",
            "Retention cleanup: " + expiredSessions + " expired sessions, " + deletedUsers + " deletion requests executed", true);

        return Map.of(
            "success", true,
            "expiredSessionsRemoved", expiredSessions,
            "deletionRequestsExecuted", deletedUsers
        );
    }

    private String generateToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("userId", user.getId())
            .claim("roles", user.getRoles())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    private String generateRefreshToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("userId", user.getId())
            .claim("type", "refresh")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpiration))
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    private Map<String, Object> getUserInfo(User user) {
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "roles", user.getRoles(),
            "mfaEnabled", user.getMfaEnabled(),
            "isEnterpriseUser", user.getIsEnterpriseUser()
        );
    }
}
