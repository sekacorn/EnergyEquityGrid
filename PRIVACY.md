# Privacy Policy Notes

This document explains what EnergyEquityGrid can store and what deployers must review before using it with real people, organizations, or community datasets.

It is an implementation guide, not legal advice or a complete privacy policy for every deployment.

## What Data The App Can Store

Depending on which features are enabled and used, EnergyEquityGrid can store:

- Account data: username, email address, hashed password, roles, MFA status, SSO provider identifiers, organization fields, timestamps, and account status.
- Authentication/session data: JWT-related session records, login timestamps, failed login attempts, lockout timestamps, refresh/session metadata, and security audit events.
- Consent data: data-processing consent, privacy-policy acceptance, optional marketing/analytics consent, timestamps, and consent history.
- Uploaded energy data: source, energy type, latitude, longitude, potential, current capacity, upload metadata, and uploader reference.
- Uploaded community data: community name, latitude, longitude, population, energy demand, grid access, GeoJSON data, upload metadata, and uploader reference.
- Uploaded infrastructure data: infrastructure type, latitude, longitude, capacity, status, owner, upload metadata, and uploader reference.
- Collaboration data: room/session names, participant display names, planning notes, annotations, timestamps, and in-memory room state.
- AI request data: prediction inputs such as coordinates, population, current demand, grid access, energy preference, and natural-language guidance or troubleshooting prompts.
- Technical data: service logs, health checks, request metadata, IP address, user agent, and security-relevant event logs where configured.
- Browser-local data: frontend localStorage values such as auth/session preferences and cookie/storage consent state.

Some deployments may store less data if features are disabled, routes are restricted, logs are reduced, or uploaded data is removed.

## Demo / Mock Use Vs Real Deployment

### Demo Or Local Development

The repository includes local development and mock/demo patterns, including sample 3D data, a mock server, prefilled local screenshot credentials, and Docker Compose defaults.

For demos:

- Use synthetic or public sample data.
- Do not use real personal data, utility records, private infrastructure data, or sensitive community datasets.
- Replace screenshots if they show real names, locations, accounts, logs, or uploaded records.
- Treat AI predictions and planning guidance as demonstration outputs unless a validated model and review process are supplied.
- Do not rely on mock credentials or local defaults for anything outside a demo environment.

### Real Deployment

For production, research, public-sector, nonprofit, university, or community use:

- Replace all default secrets and credentials.
- Review what data the deployment collects and why.
- Publish deployment-specific privacy notices and contact information.
- Decide who is the data controller, processor, administrator, and security owner.
- Set retention periods for account, upload, collaboration, AI request, audit, and log data.
- Restrict access to uploaded datasets and collaboration notes.
- Review whether uploaded location or infrastructure data could identify people, households, critical facilities, or vulnerable communities.
- Complete legal, privacy, accessibility, security, and AI-governance review before public launch.

## GDPR Responsibilities For Deployers

EnergyEquityGrid includes GDPR-oriented workflows, but deploying the app does not automatically make a deployment GDPR-compliant.

Deployers should:

- Identify the data controller and any processors.
- Define lawful bases for each data category and purpose.
- Confirm that consent text, privacy-policy text, and data-rights workflows match the actual deployment.
- Test access, export, deletion request, and consent-update workflows.
- Define correction/rectification and deletion-cancellation processes where applicable.
- Complete a Data Protection Impact Assessment if the data, AI-assisted analysis, vulnerable population, location data, or monitoring context requires one.
- Document cross-border transfer safeguards if data leaves the EU/EEA.
- Configure retention periods and deletion processes for accounts, sessions, uploads, collaboration notes, audit logs, and backups.

## Public-Sector Responsibilities

For public-sector, federally funded, educational, infrastructure, or grant-funded deployments, deployers should also review:

- Section 508 and WCAG accessibility obligations.
- NIST SP 800-53 or NIST Cybersecurity Framework control mapping where applicable.
- FedRAMP requirements if the system is offered as or deployed into a federal cloud context.
- Procurement, records retention, open records, research ethics, and grant-specific requirements.
- Accessibility statements, vulnerability reporting, incident response, and operational ownership.

## Privacy Status

This repository provides privacy-oriented implementation scaffolding, including consent logging, data access, JSON export, deletion requests, privacy-page UI, and retention cleanup. It is not a complete privacy program by itself. Each deployment must adapt the notices, controls, retention settings, and operating procedures to its own data, jurisdiction, users, and mission.
