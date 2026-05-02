# Security Policy

EnergyEquityGrid is intended to be free or low-cost software for nonprofits, universities, researchers, students, and public-interest teams. Security reports are welcome, especially when they help these groups run the software more safely.

## Reporting Vulnerabilities

No dedicated security contact is currently listed in this repository.

If you find a vulnerability, please report it through the project's GitHub issue tracker or the repository owner's GitHub profile. Do not include exploitable details, secrets, personal data, or live attack steps in a public issue. If GitHub private vulnerability reporting is enabled for this repository, use that instead.

Helpful details to include:

- A short description of the issue.
- Affected component, route, service, or configuration file.
- Steps to reproduce using local/demo data.
- Expected impact.
- Suggested fix, if known.

## Data That Should Not Be Used In Demos

Do not use real sensitive data in demos, screenshots, sample uploads, tests, or public issue reports.

Avoid using:

- Real names, emails, phone numbers, home addresses, or precise household locations.
- Medical, legal, educational, employment, immigration, or social-service records.
- Utility bills, account numbers, meter identifiers, or customer records.
- API keys, passwords, OAuth secrets, JWT secrets, private keys, certificates, or database credentials.
- Nonpublic infrastructure details that could create safety or security risk.
- Real community vulnerability data unless the organization has permission to publish it.
- Any dataset that could identify a person or household when combined with location or infrastructure records.

Use synthetic, anonymized, aggregated, or public sample data whenever possible.

## Production Hardening Checklist

Before running EnergyEquityGrid outside a local demo:

- [ ] Replace all default secrets in `.env`, including `POSTGRES_PASSWORD` and `JWT_SECRET`.
- [ ] Generate a strong JWT secret and keep it server-side.
- [ ] Restrict `ALLOWED_ORIGINS` to trusted domains.
- [ ] Enable HTTPS/TLS at the reverse proxy or hosting layer.
- [ ] Review and lock down admin, moderator, role-promotion, SSO, and MFA workflows.
- [ ] Confirm account lockout and session expiration settings match your risk model.
- [ ] Configure centralized logging and protect audit logs from unauthorized access.
- [ ] Set log retention policies and avoid logging sensitive uploaded data.
- [ ] Back up PostgreSQL and test restoration.
- [ ] Review Redis exposure and keep it on a private network.
- [ ] Scan Node, Java, Python, Docker image, and operating-system dependencies.
- [ ] Review and remediate `npm audit`, Maven, Python, and container scan findings.
- [ ] Configure monitoring and alerting for service health, failed auth events, and suspicious traffic.
- [ ] Keep uploaded datasets separate from public demo data.
- [ ] Review NGINX security headers, rate limits, client upload size, and TLS settings.
- [ ] Complete privacy, accessibility, AI-governance, and compliance reviews before production or public-sector use.

## Security Status

This repository includes security-oriented scaffolding such as JWT authentication, account lockout, audit logging, rate limits, CORS configuration, NGINX security headers, and deployment notes. It is not certified under NIST, FedRAMP, NIS2, the Cyber Resilience Act, or any other security framework. Deployers are responsible for production hardening and compliance validation.
