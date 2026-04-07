package com.energy.session.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true)
    private String username;

    @NotNull
    @Email
    @Column(unique = true)
    private String email;

    @NotNull
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    private Boolean enabled = true;
    private Boolean accountNonLocked = true;
    private Boolean mfaEnabled = false;
    private String mfaSecret;
    private String ssoProvider;
    private String ssoUserId;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String organization;
    private Boolean isEnterpriseUser = false;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    private LocalDateTime lockoutUntil;

    private LocalDateTime passwordChangedAt;

    // GDPR Article 7: Consent tracking
    @Column(name = "consent_data_processing")
    private Boolean consentDataProcessing = false;

    @Column(name = "consent_data_processing_at")
    private LocalDateTime consentDataProcessingAt;

    @Column(name = "consent_marketing")
    private Boolean consentMarketing = false;

    @Column(name = "consent_marketing_at")
    private LocalDateTime consentMarketingAt;

    @Column(name = "consent_analytics")
    private Boolean consentAnalytics = false;

    @Column(name = "consent_analytics_at")
    private LocalDateTime consentAnalyticsAt;

    @Column(name = "privacy_policy_accepted_at")
    private LocalDateTime privacyPolicyAcceptedAt;

    @Column(name = "data_deletion_requested_at")
    private LocalDateTime dataDeletionRequestedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles.add(Role.USER);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Boolean getAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }
    public Boolean getMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(Boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public String getMfaSecret() { return mfaSecret; }
    public void setMfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; }
    public String getSsoProvider() { return ssoProvider; }
    public void setSsoProvider(String ssoProvider) { this.ssoProvider = ssoProvider; }
    public String getSsoUserId() { return ssoUserId; }
    public void setSsoUserId(String ssoUserId) { this.ssoUserId = ssoUserId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public Boolean getIsEnterpriseUser() { return isEnterpriseUser; }
    public void setIsEnterpriseUser(Boolean isEnterpriseUser) { this.isEnterpriseUser = isEnterpriseUser; }
    public Integer getFailedLoginAttempts() { return failedLoginAttempts == null ? 0 : failedLoginAttempts; }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
    public LocalDateTime getLockoutUntil() { return lockoutUntil; }
    public void setLockoutUntil(LocalDateTime lockoutUntil) { this.lockoutUntil = lockoutUntil; }
    public LocalDateTime getPasswordChangedAt() { return passwordChangedAt; }
    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) { this.passwordChangedAt = passwordChangedAt; }
    public Boolean getConsentDataProcessing() { return consentDataProcessing != null && consentDataProcessing; }
    public void setConsentDataProcessing(Boolean consentDataProcessing) { this.consentDataProcessing = consentDataProcessing; }
    public LocalDateTime getConsentDataProcessingAt() { return consentDataProcessingAt; }
    public void setConsentDataProcessingAt(LocalDateTime consentDataProcessingAt) { this.consentDataProcessingAt = consentDataProcessingAt; }
    public Boolean getConsentMarketing() { return consentMarketing != null && consentMarketing; }
    public void setConsentMarketing(Boolean consentMarketing) { this.consentMarketing = consentMarketing; }
    public LocalDateTime getConsentMarketingAt() { return consentMarketingAt; }
    public void setConsentMarketingAt(LocalDateTime consentMarketingAt) { this.consentMarketingAt = consentMarketingAt; }
    public Boolean getConsentAnalytics() { return consentAnalytics != null && consentAnalytics; }
    public void setConsentAnalytics(Boolean consentAnalytics) { this.consentAnalytics = consentAnalytics; }
    public LocalDateTime getConsentAnalyticsAt() { return consentAnalyticsAt; }
    public void setConsentAnalyticsAt(LocalDateTime consentAnalyticsAt) { this.consentAnalyticsAt = consentAnalyticsAt; }
    public LocalDateTime getPrivacyPolicyAcceptedAt() { return privacyPolicyAcceptedAt; }
    public void setPrivacyPolicyAcceptedAt(LocalDateTime privacyPolicyAcceptedAt) { this.privacyPolicyAcceptedAt = privacyPolicyAcceptedAt; }
    public LocalDateTime getDataDeletionRequestedAt() { return dataDeletionRequestedAt; }
    public void setDataDeletionRequestedAt(LocalDateTime dataDeletionRequestedAt) { this.dataDeletionRequestedAt = dataDeletionRequestedAt; }
}
