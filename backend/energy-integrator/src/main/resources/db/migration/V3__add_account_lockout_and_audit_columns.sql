-- NIST SP 800-53 SC-28: Enable pgcrypto for column-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- NIST SP 800-53 AC-7: Account lockout after failed login attempts
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- NIST SP 800-53 AU-2/AU-3: Audit log table for security-relevant events
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    ip_address VARCHAR(100),
    user_agent TEXT,
    details TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_username ON audit_log(username);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
