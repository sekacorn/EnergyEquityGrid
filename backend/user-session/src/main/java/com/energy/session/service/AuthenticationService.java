package com.energy.session.service;

import com.energy.session.model.*;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Value("${mfa.issuer}")
    private String mfaIssuer;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public Map<String, Object> registerUser(String username, String email, String password, String mbtiType) {
        if (userRepository.existsByUsername(username)) {
            return Map.of("success", false, "message", "Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            return Map.of("success", false, "message", "Email already exists");
        }

        User user = new User(username, email, passwordEncoder.encode(password));
        user.setMbtiType(mbtiType);
        user.getRoles().add(Role.USER);
        userRepository.save(user);

        return Map.of(
            "success", true,
            "message", "User registered successfully",
            "userId", user.getId()
        );
    }

    public Map<String, Object> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "Invalid credentials");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Map.of("success", false, "message", "Invalid credentials");
        }

        if (!user.getEnabled() || !user.getAccountNonLocked()) {
            return Map.of("success", false, "message", "Account is disabled or locked");
        }

        if (user.getMfaEnabled()) {
            return Map.of(
                "success", true,
                "requiresMfa", true,
                "userId", user.getId()
            );
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

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
            // Create new SSO user
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
            return Map.of("success", false, "message", "Invalid MFA code");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

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

        return Map.of("success", true, "message", "User promoted to moderator");
    }

    public Map<String, Object> promoteToAdmin(Long userId, Long adminId) {
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isEmpty() || !adminOpt.get().getRoles().contains(Role.ADMIN)) {
            return Map.of("success", false, "message", "Unauthorized");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }

        User user = userOpt.get();
        user.getRoles().add(Role.ADMIN);
        userRepository.save(user);

        return Map.of("success", true, "message", "User promoted to admin");
    }

    private String generateToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("userId", user.getId())
            .claim("roles", user.getRoles())
            .claim("mbtiType", user.getMbtiType())
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
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration * 7))
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    private Map<String, Object> getUserInfo(User user) {
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "roles", user.getRoles(),
            "mbtiType", user.getMbtiType() != null ? user.getMbtiType() : "UNKNOWN",
            "mfaEnabled", user.getMfaEnabled(),
            "isEnterpriseUser", user.getIsEnterpriseUser()
        );
    }
}
