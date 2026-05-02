# EnergyEquityGrid Compliance Checklist

This checklist helps nonprofits, universities, researchers, students, and public-interest teams prepare EnergyEquityGrid for responsible use. It is not legal advice, a certification, or a substitute for a deployment-specific review.

Use it before public launch, production use, grant-funded deployment, research publication, or EU/EEA-facing service operation.

## 1. Project Ownership

- [ ] Identify the organization operating the deployment.
- [ ] Identify the technical owner responsible for uptime, secrets, logs, and updates.
- [ ] Identify the data protection contact or privacy owner.
- [ ] Document whether the deployment is for research, education, public service, internal planning, or public access.
- [ ] Document whether the deployment is experimental, pilot, production, or archival.

## 2. GDPR

- [ ] Confirm whether the deployment processes personal data.
- [ ] Identify the data controller and any processors.
- [ ] Define lawful bases for each category of personal data.
- [ ] Review uploaded energy, community, infrastructure, and collaboration datasets for personal data.
- [ ] Confirm that registration consent text matches the actual deployment.
- [ ] Confirm that the privacy policy lists accurate contact details, data categories, retention periods, and user rights.
- [ ] Test data access, JSON export, deletion request, and consent update workflows.
- [ ] Define a process for rectification requests.
- [ ] Define a process for deletion grace-period cancellation, if offered.
- [ ] Set retention periods for accounts, sessions, audit logs, uploaded data, and collaboration notes.
- [ ] Complete a Data Protection Impact Assessment if the use case, population, data sensitivity, monitoring, or automated analysis requires one.
- [ ] Document cross-border transfer safeguards if data leaves the EU/EEA.

## 3. European Accessibility Act / EN 301 549

- [ ] Run keyboard-only navigation testing across all primary workflows.
- [ ] Run screen reader checks for navigation, forms, status messages, chat, data upload, 3D viewer alternatives, login, privacy, and compliance pages.
- [ ] Validate color contrast, text resizing, focus order, labels, error messages, headings, and landmark structure.
- [ ] Confirm non-text visualizations have useful text alternatives.
- [ ] Confirm motion can be reduced or disabled.
- [ ] Test forms and dynamic content against WCAG 2.1 AA expectations reflected in EN 301 549 v3.2.1.
- [ ] Document known accessibility limitations.
- [ ] Publish an accessibility statement with a feedback path.
- [ ] Retest accessibility after local branding, map, chart, or workflow changes.

## 4. EU AI Act

- [ ] Identify every AI-assisted feature in the deployment.
- [ ] Confirm whether the feature is deterministic guidance, a trained model, an external LLM, or another AI system.
- [ ] Classify the intended use under the AI Act before relying on outputs in real decisions.
- [ ] Document intended use, prohibited uses, known limitations, data inputs, output interpretation, and required human review.
- [ ] Document model provenance and whether `model.pt` is trained, validated, or absent.
- [ ] Validate prediction behavior with representative local data before operational use.
- [ ] Add user-facing notices that AI-assisted estimates are planning aids, not final engineering, legal, financial, or utility decisions.
- [ ] Maintain logs needed for troubleshooting and traceability without over-collecting personal data.
- [ ] Define a process for monitoring accuracy, incidents, and unexpected behavior.
- [ ] Review any external AI provider terms, data retention, and subprocessors if an external model is added.

## 5. NIS2 Directive

- [ ] Determine whether the deploying organization is an essential or important entity under applicable Member State law.
- [ ] Identify whether the deployment supports energy, public administration, digital infrastructure, education, health, research, or another regulated sector.
- [ ] Define cybersecurity roles and escalation contacts.
- [ ] Configure strong secrets, restricted CORS origins, HTTPS/TLS, and deployment-specific admin access.
- [ ] Enable centralized logging and monitoring.
- [ ] Define incident detection, triage, response, notification, and post-incident review processes.
- [ ] Maintain backups and restoration procedures for PostgreSQL, uploaded data, and configuration.
- [ ] Review supplier, dependency, container image, and hosting risks.
- [ ] Schedule vulnerability scans and dependency updates.
- [ ] Document business continuity expectations for outages or degraded service.

## 6. Cyber Resilience Act

- [ ] Determine whether a specific distribution is placed on the EU market as a product with digital elements.
- [ ] Identify the manufacturer, distributor, open-source steward, or operator role for the deployment.
- [ ] Maintain dependency and component records, such as an SBOM where appropriate.
- [ ] Define vulnerability intake, assessment, remediation, and disclosure processes.
- [ ] Track security updates and support periods for each release.
- [ ] Review Docker images, base images, operating system packages, Java dependencies, Node packages, and Python packages.
- [ ] Document secure installation and configuration instructions.
- [ ] Document default security settings and required production changes.
- [ ] Prepare conformity evidence if the software is commercially distributed or otherwise made available in scope.

## 7. Security Baseline

- [ ] Replace all default secrets before deployment.
- [ ] Store secrets outside source control.
- [ ] Restrict administrative endpoints and role promotion workflows.
- [ ] Configure HTTPS and secure cookies where applicable.
- [ ] Restrict allowed origins.
- [ ] Set log retention and access controls.
- [ ] Review JWT expiration and refresh token settings.
- [ ] Confirm account lockout behavior.
- [ ] Confirm rate limits at the reverse proxy.
- [ ] Run dependency audits for frontend, backend, and Python services.
- [ ] Run container image scans before production deployment.

## 8. Section 508 / WCAG 2.1 AA

- [ ] Run Section 508 testing for public-sector or federally funded deployments.
- [ ] Confirm all primary workflows work with keyboard-only navigation.
- [ ] Confirm screen reader behavior for navigation, forms, errors, status messages, chat, tables, and collaboration updates.
- [ ] Confirm color contrast, focus visibility, reflow, zoom, headings, labels, and link purpose.
- [ ] Confirm 3D, map, chart, image, and canvas content has useful text alternatives.
- [ ] Publish an accessibility statement and remediation plan for known gaps.

## 9. NIST SP 800-53 / NIST CSF

- [ ] Select the applicable control baseline or framework profile.
- [ ] Map implemented controls to the selected baseline, including access control, audit, identification/authentication, system communications, configuration, incident response, and contingency planning.
- [ ] Document which controls are implemented by the application, inherited from hosting infrastructure, handled by organizational process, or not applicable.
- [ ] Review account lockout, JWT expiration, audit logging, rate limits, TLS, CORS, secrets, and database protection settings.
- [ ] Define incident response, vulnerability management, backup, recovery, and continuous monitoring procedures.
- [ ] Keep evidence for tests, reviews, dependency updates, and security configuration decisions.

## 10. FedRAMP Readiness

- [ ] Do not claim FedRAMP authorization unless a formal authorization exists.
- [ ] If federal cloud deployment is planned, define the cloud boundary, authorization path, impact level, inherited controls, and responsible parties.
- [ ] Prepare system security plan materials only after the deployment architecture is stable.
- [ ] Identify continuous monitoring, vulnerability scanning, access review, logging, and incident reporting responsibilities.

## 11. Research And Public-Interest Use

- [ ] Document data sources, licenses, assumptions, and preprocessing steps.
- [ ] Keep research datasets separate from production personal data.
- [ ] Document limitations before publishing findings or policy recommendations.
- [ ] Add human review for recommendations affecting community infrastructure, funding, safety, or access to services.
- [ ] Preserve reproducibility notes for model versions, configuration, and source datasets.

## 12. Release Review

- [ ] Confirm README setup instructions are accurate.
- [ ] Confirm the Compliance page matches the current code.
- [ ] Confirm screenshots and docs do not expose secrets or personal data.
- [ ] Run frontend build.
- [ ] Run backend tests.
- [ ] Run AI service tests.
- [ ] Run frontend tests.
- [ ] Record known warnings, unresolved vulnerabilities, and production blockers.

## Current Repository Notes

- The project includes GDPR-oriented consent, access, export, deletion, and retention workflows.
- The frontend includes accessibility-oriented UI patterns, but it still needs a formal EN 301 549, Section 508, and WCAG audit before public deployment.
- The prediction service falls back to a randomly initialized PyTorch model if no trained `model.pt` is present.
- The guidance service is deterministic and does not call an external hosted LLM in the current code.
- Docker Compose and NGINX provide a local deployment baseline, but production hardening remains the responsibility of the deploying organization.
