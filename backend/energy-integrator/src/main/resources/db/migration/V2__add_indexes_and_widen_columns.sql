-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_energy_uploaded_by ON energy_data(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_energy_created_at ON energy_data(created_at);
CREATE INDEX IF NOT EXISTS idx_community_uploaded_by ON community_data(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_infrastructure_uploaded_by ON infrastructure_data(uploaded_by);

-- Widen ip_address to accommodate IPv6 addresses
ALTER TABLE user_sessions ALTER COLUMN ip_address TYPE VARCHAR(100);

-- Add unique constraints on session tokens to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token) WHERE session_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_refresh ON user_sessions(refresh_token) WHERE refresh_token IS NOT NULL;
