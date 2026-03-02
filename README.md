# EnergyEquityGrid

**Democratizing Access to Clean and Affordable Energy**

EnergyEquityGrid is a production-ready, full-stack web application designed to address global energy poverty by integrating renewable energy data, community information, and infrastructure data to provide personalized AI-driven energy solutions with stunning 3D visualizations.

## Purpose and Impact

- **Addresses Energy Poverty**: Provides data-driven solutions to optimize renewable energy access for the 733 million people without electricity (IEA estimate)
- **Inclusive Design**: Tailored interfaces for all 16 MBTI personality types
- **Global Accessibility**: Open-source architecture for deployment in low-resource settings
- **Unique Value**: Integrates renewable energy, community, and infrastructure data with AI, 3D visualizations, and real-time collaboration

## Key Features

### 1. Data Integration

- Aggregates renewable energy data from IRENA and NREL
- Imports community data from OpenStreetMap (GeoJSON)
- Supports CSV, JSON, and GeoJSON formats
- Validates inputs to ensure data integrity

### 2. 3D Visualization

- Interactive 3D energy grid maps using Three.js
- Solar potential, wind turbine placement, and microgrid networks
- Zoom/pan controls with export to PNG/SVG/STL
- MBTI-tailored visual styles

### 3. AI-Driven Energy Solutions

- PyTorch-based energy demand predictions
- Personalized recommendations for individuals and communities
- MBTI-tailored advice (e.g., strategic for ENTJ, creative for INFP)

### 4. Natural Language Queries via LLM

- Ask questions in plain English
- MBTI-customized responses
- Examples: "How can I power my home with solar?" or "Best sustainable energy for my community?"

### 5. Real-Time Collaboration

- WebSocket-based collaboration for communities, NGOs, and policymakers
- Share energy plans and infrastructure strategies
- MBTI-tailored collaboration tools

### 6. Enterprise Authentication

- **User Roles**: Users, Moderators, Admins
- **SSO Support**: Google, Azure, Okta
- **MFA**: Multi-factor authentication with Google Authenticator
- **JWT**: Secure token-based authentication

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Frontend       | React 18, Three.js, Tailwind CSS, Vite                    |
| Backend        | Java 17, Spring Boot 3, Spring Security, Spring WebSocket |
| AI Service     | Python 3.10, FastAPI, PyTorch                             |
| LLM Service    | Python 3.10, FastAPI                                      |
| Database       | PostgreSQL 15, Redis 7                                    |
| Auth           | JWT, OAuth2, Google Authenticator                         |
| Infrastructure | Docker, Docker Compose, NGINX                             |
| Monitoring     | Prometheus, Grafana                                       |

## Project Structure

```
EnergyEquityGrid/
├── backend/
│   ├── energy-integrator/      # Data integration service
│   ├── user-session/            # Authentication & user management
│   └── [other microservices]
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── services/            # API clients
│   └── package.json
├── ai-model/                    # Python AI services
│   ├── energy_predictor.py      # PyTorch energy predictions
│   ├── llm_service.py           # Natural language processing
│   └── requirements.txt
├── database/
│   ├── postgres/schema.sql      # Database schema
│   └── redis/config.yaml        # Redis configuration
├── infra/
│   └── nginx/default.conf       # Reverse proxy config
├── tests/                       # Test suites
├── docker-compose.yml           # Container orchestration
├── LICENSE                      # Apache 2.0 license
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- Python 3.10+ (for local AI services)
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sekacorn/EnergyEquityGrid.git
   cd EnergyEquityGrid
   ```

2. **Start all services with Docker Compose:**

   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API Gateway (NGINX): http://localhost:8080
   - Energy Integrator: http://localhost:8081
   - User Session Service: http://localhost:8082
   - AI Prediction Service: http://localhost:8083
   - LLM Service: http://localhost:8084

### Local Development (Without Docker)

#### Backend Services

```bash
# Energy Integrator
cd backend/energy-integrator
mvn spring-boot:run

# User Session
cd backend/user-session
mvn spring-boot:run
```

#### AI Services

```bash
cd ai-model

# Install dependencies
pip install -r requirements.txt

# Run AI Predictor
python -m uvicorn energy_predictor:app --host 0.0.0.0 --port 8083

# Run LLM Service (in separate terminal)
python -m uvicorn llm_service:app --host 0.0.0.0 --port 8084
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Database

```bash
# Start PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=energyequitygrid \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15-alpine

# Start Redis
docker run -d -p 6379:6379 redis:7-alpine
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=energyequitygrid
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT
JWT_SECRET=EnergyEquityGrid2025SecretKeyForJWTAuthenticationAndAuthorization

# SSO (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
```

## Testing

### Backend Tests (JUnit)

```bash
cd backend/energy-integrator
mvn test

cd backend/user-session
mvn test
```

### AI Service Tests (Pytest)

```bash
cd tests/ai
pytest test_energy_predictor.py -v
pytest test_llm_service.py -v
```

### Frontend Tests (Vitest)

```bash
cd frontend
npm test
```

### End-to-End Testing

```bash
# Test AI Predictor
curl -X POST http://localhost:8083/predict \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "population": 5000, "mbti_type": "ENTJ"}'

# Test LLM Service
curl -X POST http://localhost:8084/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How can I use solar energy?", "mbti_type": "INFP"}'

# Test User Registration
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123", "mbtiType": "ENTJ"}'
```

## User Roles and Management

### Roles

- **USER**: Regular users can upload data, view visualizations, get predictions
- **MODERATOR**: Can moderate content and assist users
- **ADMIN**: Full system access, can promote users to moderator/admin roles

### Default Admin Account

- **Username**: admin
- **Email**: admin@energyequitygrid.com
- **Password**: admin123 (Change in production!)

### Promoting Users

```bash
# Promote to Moderator
curl -X POST http://localhost:8082/api/auth/promote/moderator \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "adminId": 1}'

# Promote to Admin
curl -X POST http://localhost:8082/api/auth/promote/admin \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "adminId": 1}'
```

### SSO and MFA

#### Enable MFA

1. Log in to the application
2. Navigate to user settings
3. Enable MFA
4. Scan QR code with Google Authenticator
5. Verify with 6-digit code

#### SSO Login

Supports Google, Azure, and Okta SSO. Configure OAuth2 credentials in `application.yml`.

## MBTI Personality Types Support

All 16 MBTI types are supported with tailored interfaces and messaging:

- **ENTJ** - Strategic, commanding, results-focused
- **INFP** - Creative, values-driven, empathetic
- **INFJ** - Insightful, community-focused, holistic
- **ESTP** - Energetic, practical, action-oriented
- **INTJ** - Analytical, strategic, systematic
- **INTP** - Logical, theoretical, detail-oriented
- **ISTJ** - Structured, reliable, methodical
- **ESFJ** - Supportive, warm, community-oriented
- **ISFP** - Gentle, aesthetic, present-focused
- **ENTP** - Innovative, exploratory, witty
- **ISFJ** - Nurturing, practical, stable
- **ESFP** - Enthusiastic, spontaneous, vibrant
- **ENFJ** - Inspirational, visionary, motivational
- **ESTJ** - Direct, organized, authoritative
- **ISTP** - Practical, hands-on, problem-solving

## Data Formats

### Energy Data CSV Example

```csv
source,energyType,latitude,longitude,potential,currentCapacity
NREL,solar,40.7128,-74.0060,850,500
IRENA,wind,51.5074,-0.1278,650,400
```

### Community Data CSV Example

```csv
communityName,latitude,longitude,population,energyDemand,hasGridAccess
New York,40.7128,-74.0060,8000000,15000,true
Rural Village,12.3456,45.6789,500,50,false
```

### Infrastructure Data CSV Example

```csv
infrastructureType,latitude,longitude,capacity,status,owner
grid,40.7128,-74.0060,10000,operational,Utility Co
microgrid,12.3456,45.6789,500,planned,Community
```

## Security

- **Input Validation**: hibernate-validator, sanitize-html, pydantic
- **Data Encryption**: TLS for transit, AES-256 at rest
- **Rate Limiting**: Applied via NGINX (10 req/s for API, 5 req/s for AI)
- **CORS/CSRF**: Strict policies
- **Logging**: SLF4J with no sensitive data
- **Authentication**: JWT with secure secret keys
- **MFA**: Google Authenticator TOTP

## License

This project is licensed under the **Apache License 2.0**.
See [LICENSE](LICENSE) for full terms.

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Code Quality Standards

- **Backend**: ESLint, Checkstyle
- **AI Services**: Flake8, Black
- **Frontend**: ESLint, Prettier
- **Test Coverage**: Aim for >90%

## Contact and Support

- **Author**: sekacorn
- **Email**: Sekacorn@gmail.com
- **Jurisdiction**: United States

## Why EnergyEquityGrid Advances Humanity

- **Addresses Energy Poverty**: Tackles IEA's 733 million people without electricity with data-driven renewable energy solutions
- **Empowers Stakeholders**: Provides personalized insights for individuals, communities, and policymakers
- **Inclusive and Accessible**: Open-source design and MBTI-tailored interfaces ensure usability in diverse, low-resource settings
- **Scalable Impact**: Real-time collaboration and compatibility with QGIS/IRENA datasets enable global energy equity improvements

## Roadmap

- [ ] Mobile app (iOS and Android)
- [ ] Offline mode for low-connectivity areas
- [ ] Machine learning model improvements
- [ ] Additional language support
- [ ] Kubernetes deployment templates
- [ ] Advanced analytics dashboard
- [ ] API marketplace for third-party integrations

## Additional Resources

- **API Documentation**: See `/docs` after starting services
- **User Guide**: See `docs/USER_GUIDE.md`
- **Developer Guide**: See `docs/DEVELOPER_GUIDE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`

## Acknowledgments

This project uses open-source data from:

- **IRENA**: International Renewable Energy Agency
- **NREL**: National Renewable Energy Laboratory
- **OpenStreetMap**: Community mapping data

Built with open-source technologies:

- Spring Boot, React, PyTorch, Three.js, PostgreSQL, Redis, and many more

---

**Built with passion to democratize energy access worldwide.**

Copyright (c) 2025 sekacorn. Licensed under Apache License 2.0.
