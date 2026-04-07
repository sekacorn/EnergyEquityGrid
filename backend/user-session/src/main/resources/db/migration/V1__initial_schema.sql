CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    account_non_locked BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    sso_provider VARCHAR(50),
    sso_user_id VARCHAR(255),
    organization VARCHAR(255),
    is_enterprise_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(500),
    refresh_token VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT,
    preferences TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS energy_data (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    energy_type VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    potential DOUBLE PRECISION,
    current_capacity DOUBLE PRECISION,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS community_data (
    id BIGSERIAL PRIMARY KEY,
    community_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    population INTEGER,
    energy_demand DOUBLE PRECISION,
    demand_profile VARCHAR(100),
    has_grid_access BOOLEAN DEFAULT false,
    geojson_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS infrastructure_data (
    id BIGSERIAL PRIMARY KEY,
    infrastructure_type VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity DOUBLE PRECISION,
    status VARCHAR(50),
    owner VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_energy_location ON energy_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_energy_type ON energy_data(energy_type);
CREATE INDEX IF NOT EXISTS idx_community_location ON community_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_infrastructure_location ON infrastructure_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_sso ON users(sso_provider, sso_user_id);
