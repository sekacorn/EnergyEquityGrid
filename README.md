# EnergyEquityGrid

**Democratizing Access to Clean and Affordable Energy**

EnergyEquityGrid is a full-stack web application for exploring energy access challenges with renewable energy data, community information, infrastructure context, AI-assisted recommendations, and interactive 3D visualization.

![Home page with feature overview, AI assistant, and cookie consent banner](screenshot-01.png)

![Analyze page with data upload and AI energy predictions](screenshot-02.png)

![3D energy grid visualization with solar, wind, and hydro markers](screenshot-03.png)

![Collaboration room with shared planning feed and session controls](screenshot-04.png)

## Purpose and Impact

- Addresses energy poverty with practical planning tools.
- Supports community, NGO, and policymaker workflows.
- Uses open-source components that can be adapted for local deployment.
- Combines data ingestion, visualization, prediction, and troubleshooting in one platform.

## Key Features

### 1. Data Integration

- Aggregates renewable energy data from sources such as IRENA and NREL.
- Imports community data from OpenStreetMap and related datasets.
- Supports CSV, JSON, and GeoJSON uploads with file validation (type, size, extension).

### 2. 3D Visualization

- Interactive 3D energy grid maps using Three.js (`@react-three/fiber`).
- Viewer supports rotate, pan, and zoom controls.
- Responsive layout for desktop and smaller screens.
- Accessible data table alternative below the 3D viewer for screen readers (WCAG 2.1 AA).

### 3. AI-Driven Energy Solutions

- PyTorch-based energy demand predictions.
- Practical recommendations for solar, wind, hybrid, grid expansion, and microgrids.
- Coordinate validation and NaN/Inf output guards for safer request handling.
- AI requests are routed through the backend gateway (energy-integrator), not directly to AI services.

### 4. Natural Language Guidance

- Ask questions in plain English.
- Get explanations about solar, wind, microgrids, grid access, and planning tradeoffs.
- Troubleshoot common workflow issues through the LLM service.
- Responses are sanitized with `sanitize-html` before rendering.

### 5. Collaboration

- WebSocket-based collaboration rooms for shared planning updates.
- Users can join a named session, view active participants, and post live annotations.
- Exponential backoff reconnection (up to 8 attempts).
- Configure the frontend collaboration URL with `VITE_WS_COLLAB`.

### 6. Enterprise Authentication

- User, moderator, and admin roles with JWT (HS512) tokens.
- MFA support with Google Authenticator (TOTP).
- SSO-ready configuration for Google, Azure, and Okta.
- Account lockout after 5 failed login attempts (30-minute lockout, NIST AC-7).
- Security audit logging for all authentication events.

### 7. Privacy & GDPR Compliance

- Full privacy policy page documenting data collection, legal bases, and retention periods.
- User data rights: access (Art. 15), export as JSON (Art. 20), and erasure request (Art. 17).
- Granular consent management for data processing, marketing, and analytics (Art. 7).
- Consent history logging for Art. 30 record-keeping.
- Cookie/localStorage consent banner with Essential Only / Accept All options.
- Automated data retention scheduler: 90-day session purge, 30-day deletion grace period execution.
- Registration requires explicit data processing consent.

### 8. Accessibility (Section 508 / WCAG 2.1 AA)

- Skip-to-content link and landmark roles on navigation and main content.
- All form inputs have associated `<label>` elements with `htmlFor`/`id`.
- `aria-live` regions on all dynamic content (chat, collaboration feed, status messages, predictions).
- `role="alert"` on error messages and `role="log"` on chat/collaboration feeds.
- `prefers-reduced-motion` media query disables animations.
- `focus-visible` outlines (3px emerald) for keyboard navigation.
- Accessible data table as a text equivalent for the 3D viewer canvas.
- Screen-reader-only labels on loading spinners and decorative elements.

### 9. Security Hardening (NIST SP 800-53)

- **AC-7**: Account lockout after 5 failed login attempts.
- **AC-12**: 4-hour JWT access tokens, 24-hour refresh tokens (configurable).
- **AU-2/AU-3**: Database audit log for all security events + Logback file appenders with rolling retention.
- **SC-7**: CSP with `object-src 'none'`, `frame-ancestors 'self'`, `Permissions-Policy`, `COOP`, `CORP` headers.
- **SC-13**: HTTPS/TLS ready (TLS 1.2+1.3, ECDHE ciphers, HSTS preload) — activate by mounting certs.
- **SC-28**: PostgreSQL `pgcrypto` extension enabled, data checksums on init, encrypted volume documentation.
- **IA-5**: JWT secret must be at least 64 characters (`openssl rand -base64 64`).

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Frontend       | React 18, React Router 6, Three.js, Tailwind CSS, Vite   |
| Backend        | Java 17, Spring Boot 3.2, Spring Security, Flyway         |
| AI Service     | Python 3.10, FastAPI, PyTorch, Pydantic                   |
| LLM Service    | Python 3.10, FastAPI, Pydantic                            |
| Database       | PostgreSQL 15, Redis 7                                    |
| Auth           | JWT (HS512), OAuth2, Google Authenticator (TOTP)          |
| Infrastructure | Docker, Docker Compose, NGINX                             |
| Monitoring     | Spring Actuator, Prometheus metrics endpoint              |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Java 17+
- Python 3.10+
- Git

### Installation

1. Clone the repository.

```bash
git clone https://github.com/sekacorn/EnergyEquityGrid.git
cd EnergyEquityGrid
```

2. Copy `.env.example` to `.env` and update secrets and local URLs as needed.

```bash
cp .env.example .env
# Edit .env — at minimum, change POSTGRES_PASSWORD and JWT_SECRET
```

3. Start the services.

```bash
docker-compose up --build
```

### Access the Application

| Service                | URL                         |
| ---------------------- | --------------------------- |
| Frontend               | http://localhost:3000        |
| NGINX Gateway          | http://localhost:8080        |
| Energy Integrator API  | http://localhost:8081        |
| User Session API       | http://localhost:8082        |
| AI Prediction Service  | http://localhost:8083        |
| LLM Service            | http://localhost:8084        |

### Frontend Routes

| Route            | Description                                  |
| ---------------- | -------------------------------------------- |
| `/`              | Home page with feature overview and AI chat  |
| `/analyze`       | Data upload and AI energy predictions        |
| `/explore`       | 3D energy grid visualization                 |
| `/collaborate`   | WebSocket collaboration rooms                |
| `/troubleshoot`  | AI-assisted troubleshooting                  |
| `/login`         | Authentication                               |
| `/privacy`       | Privacy policy, consent management, and data rights (GDPR) |

## Local Development

### Backend Services

```bash
cd backend/energy-integrator
mvn spring-boot:run

cd ../user-session
mvn spring-boot:run
```

### AI Services

```bash
cd ai-model
pip install -r requirements.txt
python -m uvicorn energy_predictor:app --host 0.0.0.0 --port 8083
python -m uvicorn llm_service:app --host 0.0.0.0 --port 8084
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Root Environment Variables

Use the values in `.env.example` as the starting point. Key variables:

| Variable                  | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `POSTGRES_DB`             | Database name                                   |
| `POSTGRES_USER`           | Database username                                |
| `POSTGRES_PASSWORD`       | Database password                                |
| `JWT_SECRET`              | Shared JWT signing secret (min 64 chars)         |
| `JWT_EXPIRATION`          | Access token lifetime in ms (default: 14400000 / 4h) |
| `JWT_REFRESH_EXPIRATION`  | Refresh token lifetime in ms (default: 86400000 / 24h) |
| `ALLOWED_ORIGINS`         | CORS allowed origins                             |
| `VITE_API_AI`             | Frontend AI API base URL                         |
| `VITE_API_INTEGRATOR`     | Frontend integrator API base URL                 |
| `VITE_API_SESSION`        | Frontend session API base URL                    |
| `VITE_WS_COLLAB`          | WebSocket collaboration URL                      |
| `AI_PREDICTOR_URL`        | Backend downstream AI prediction URL             |
| `AI_LLM_URL`              | Backend downstream LLM URL                       |

### AI Routing

- The frontend calls backend-owned AI routes at `/api/ai/*`.
- The energy-integrator service proxies those requests to downstream AI services using `AI_PREDICTOR_URL` and `AI_LLM_URL`.
- This keeps browser traffic pointed at one backend service instead of directly at the raw AI services.
- AI gateway endpoints require JWT authentication.

### Database Migrations

- The shared PostgreSQL schema is managed by Flyway migration scripts in both Spring services.
- Migrations are located at `backend/*/src/main/resources/db/migration/`.
- `database/postgres/schema.sql` is kept as a legacy reference only and is not used by Docker Compose.
- Spring services validate their entities against the migrated schema at startup (`ddl-auto: validate`).

Current migrations:

| Version | Description                                   |
| ------- | --------------------------------------------- |
| V1      | Initial schema (users, sessions, energy/community/infrastructure data) |
| V2      | Indexes, widened columns, unique partial indexes |
| V3      | Account lockout columns, audit log table, pgcrypto extension |
| V4      | GDPR consent columns, consent log table, retention indexes |

### Security Notes

- Do not ship shared default admin credentials in source control.
- Configure admin access through a deployment-specific bootstrap or seed process.
- Keep secrets server-side and avoid exposing them in browser code.
- Restrict `ALLOWED_ORIGINS` for non-local environments.
- Generate a strong JWT secret: `openssl rand -base64 64`.
- Enable HTTPS in production by mounting TLS certs and uncommenting the HTTPS server block in `infra/nginx/default.conf`.

### Enabling HTTPS

1. Generate or obtain TLS certificates:
   ```bash
   # Self-signed (dev/staging):
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout privkey.pem -out fullchain.pem -subj "/CN=localhost"
   ```
2. Mount certs into the NGINX container at `/etc/nginx/ssl/`.
3. Uncomment the HTTPS server block in `infra/nginx/default.conf`.
4. The HTTP server block will redirect all traffic to HTTPS.

## Testing

### Backend Tests

```bash
cd backend/energy-integrator
mvn test

cd ../user-session
mvn test
```

### AI Service Tests

```bash
pytest tests/ai/test_energy_predictor.py -v
pytest tests/ai/test_llm_service.py -v
pytest tests/ai/test_cors.py -v
```

### Frontend Tests

```bash
cd frontend
npx vitest tests/frontend/App.test.jsx
npx vitest tests/frontend/DataUpload.test.jsx
```

### End-to-End Tests

```bash
pytest tests/e2e/test_services.py -v
```

## Example API Calls

### AI Predictor (via backend gateway)

```bash
curl -X POST http://localhost:8081/api/ai/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "population": 5000, "energy_type_preference": "solar", "has_grid_access": true}'
```

### LLM Query (via backend gateway)

```bash
curl -X POST http://localhost:8081/api/ai/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"query": "How can I use solar energy?", "context": {}}'
```

### User Registration (with GDPR consent)

```bash
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123", "consentDataProcessing": "true"}'
```

### GDPR Data Access

```bash
curl http://localhost:8082/api/auth/gdpr/access/{userId}
```

### GDPR Data Export

```bash
curl http://localhost:8082/api/auth/gdpr/export/{userId}
```

### GDPR Deletion Request

```bash
curl -X POST http://localhost:8082/api/auth/gdpr/delete/{userId}
```

### Update Consent

```bash
curl -X POST http://localhost:8082/api/auth/gdpr/consent/{userId} \
  -H "Content-Type: application/json" \
  -d '{"consentType": "marketing", "granted": "true"}'
```

## Project Structure

```
EnergyEquityGrid/
  ai-model/                    # Python AI services
    energy_predictor.py        # PyTorch energy demand prediction (port 8083)
    llm_service.py             # Natural language query service (port 8084)
    Dockerfile, Dockerfile.llm
    requirements.txt
  backend/
    energy-integrator/         # Spring Boot data + AI gateway service (port 8081)
      src/main/java/com/energy/integrator/
        config/                # JwtAuthFilter, WebConfig, WebSocket config
        controller/            # DataIntegration, AiGateway, Collaboration controllers
        service/               # DataIntegration, AiGateway, CollaborationRoom services
        model/                 # JPA entities and repositories
        utils/                 # DataParser (CSV, JSON, GeoJSON)
        websocket/             # WebSocket handler
      src/main/resources/
        application.yml
        db/migration/          # Flyway V1–V4
        logback-spring.xml     # Structured logging (NIST AU-2/AU-3)
    user-session/              # Spring Boot auth service (port 8082)
      src/main/java/com/energy/session/
        config/                # WebConfig
        controller/            # AuthenticationController (auth + GDPR endpoints)
        model/                 # User, Role, UserSession, AuditLog, ConsentLog entities
        service/               # AuthenticationService, DataRetentionScheduler
      src/main/resources/
        application.yml
        db/migration/          # Flyway V1–V4
        logback-spring.xml
  database/
    postgres/schema.sql        # Legacy reference schema
    redis/config.yaml
  frontend/
    src/
      components/              # DataUpload, EnergyViewer, LLMChat, ErrorBoundary, CookieConsent
      pages/                   # Home, Analyze, Explore, Collaborate, Troubleshoot, Login, Privacy
      utils/                   # apiClient.js (shared fetch + JWT), html.js (sanitize-html)
      config.js                # Environment-based API URL configuration
      index.css                # Tailwind + accessibility styles
    index.html
    package.json
    vite.config.js
  infra/nginx/default.conf     # NGINX reverse proxy with security headers
  docker-compose.yml           # Full-stack orchestration with healthchecks
  .env.example                 # Documented environment template
  tests/
    ai/                        # PyTorch predictor, LLM service, CORS tests
    backend/                   # AuthenticationService, DataIntegration tests
    frontend/                  # App, DataUpload component tests
    e2e/                       # End-to-end service integration tests
```

## License

Licensed under [Apache 2.0](LICENSE).
