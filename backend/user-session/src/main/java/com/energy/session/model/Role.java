package com.energy.session.model;

public enum Role {
    USER,         // Regular user
    MODERATOR,    // Moderator with additional permissions
    ADMIN,        // Administrator with full permissions
    ENTERPRISE    // Enterprise user with SSO
}
