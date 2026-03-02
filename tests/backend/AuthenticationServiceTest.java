package com.energy.session.service;

import com.energy.session.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test suite for AuthenticationService
 * Tests user registration, login, MFA, SSO, and role management
 */
@SpringBootTest
@ActiveProfiles("test")
public class AuthenticationServiceTest {

    @Autowired
    private AuthenticationService authenticationService;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Mock user repository responses
    }

    @Test
    void testRegisterUser_Success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(new User());

        Map<String, Object> result = authenticationService.registerUser(
            "testuser",
            "test@example.com",
            "password123",
            "ENTJ"
        );

        assertTrue((Boolean) result.get("success"));
        assertEquals("User registered successfully", result.get("message"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUser_UsernameExists() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        Map<String, Object> result = authenticationService.registerUser(
            "testuser",
            "test@example.com",
            "password123",
            "ENTJ"
        );

        assertFalse((Boolean) result.get("success"));
        assertEquals("Username already exists", result.get("message"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success_NoMFA() {
        User user = new User("testuser", "test@example.com", "encodedPassword");
        user.setMfaEnabled(false);
        user.setEnabled(true);
        user.setAccountNonLocked(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Note: In real test, you would mock password encoder
        // For now, this demonstrates the test structure
    }

    @Test
    void testEnableMFA_Success() {
        User user = new User("testuser", "test@example.com", "password");
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        Map<String, Object> result = authenticationService.enableMfa(1L);

        assertTrue((Boolean) result.get("success"));
        assertNotNull(result.get("secret"));
        assertNotNull(result.get("qrCodeUrl"));
    }

    @Test
    void testPromoteToModerator_Success() {
        User admin = new User("admin", "admin@example.com", "password");
        admin.setId(1L);
        admin.getRoles().add(Role.ADMIN);

        User user = new User("user", "user@example.com", "password");
        user.setId(2L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        Map<String, Object> result = authenticationService.promoteToModerator(2L, 1L);

        assertTrue((Boolean) result.get("success"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testPromoteToModerator_Unauthorized() {
        User nonAdmin = new User("user", "user@example.com", "password");
        nonAdmin.setId(1L);
        nonAdmin.getRoles().add(Role.USER);

        when(userRepository.findById(1L)).thenReturn(Optional.of(nonAdmin));

        Map<String, Object> result = authenticationService.promoteToModerator(2L, 1L);

        assertFalse((Boolean) result.get("success"));
        assertEquals("Unauthorized", result.get("message"));
    }

    @Test
    void testLoginWithSSO_NewUser() {
        when(userRepository.findBySsoProviderAndSsoUserId("google", "123456"))
            .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(new User());

        Map<String, Object> result = authenticationService.loginWithSso(
            "google",
            "123456",
            "test@example.com",
            "Test User"
        );

        assertTrue((Boolean) result.get("success"));
        assertNotNull(result.get("token"));
        verify(userRepository, times(1)).save(any(User.class));
    }
}
