-- GDPR Article 7: Consent tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_data_processing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_data_processing_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_analytics BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_analytics_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_deletion_requested_at TIMESTAMP;

-- GDPR Article 30: Record of processing activities — consent history
CREATE TABLE IF NOT EXISTS consent_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_type ON consent_log(consent_type);

-- GDPR Article 5(1)(e): Data retention — auto-purge helper index
CREATE INDEX IF NOT EXISTS idx_audit_log_retention ON audit_log(created_at) WHERE created_at < NOW() - INTERVAL '2 years';
CREATE INDEX IF NOT EXISTS idx_user_sessions_retention ON user_sessions(expires_at) WHERE expires_at < NOW() - INTERVAL '90 days';
