package com.energy.session.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * GDPR Article 30: Record of processing activities — tracks every consent grant/revoke.
 */
@Entity
@Table(name = "consent_log")
public class ConsentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "consent_type", nullable = false, length = 50)
    private String consentType;

    @Column(nullable = false)
    private Boolean granted;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ConsentLog() {}

    public ConsentLog(Long userId, String consentType, boolean granted) {
        this.userId = userId;
        this.consentType = consentType;
        this.granted = granted;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getConsentType() { return consentType; }
    public void setConsentType(String consentType) { this.consentType = consentType; }
    public Boolean getGranted() { return granted; }
    public void setGranted(Boolean granted) { this.granted = granted; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
