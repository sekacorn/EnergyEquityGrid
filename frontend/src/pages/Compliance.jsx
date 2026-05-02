const europeanStandards = [
  {
    name: 'GDPR',
    scope: 'Personal data processing, consent, data subject rights, retention, auditability, and security controls.',
    currentSupport: [
      'Registration requires explicit data-processing consent.',
      'Users can request access, JSON export, deletion, and optional consent updates.',
      'Consent changes and security-sensitive events are logged for audit review.',
      'A scheduled retention job purges expired sessions and executes eligible deletion requests.'
    ],
    ownerActions: [
      'Confirm the deployment-specific controller, processor, lawful bases, contact details, and data protection process.',
      'Review uploaded datasets for personal data before production use.',
      'Complete a DPIA where local use, AI-assisted analysis, or data sensitivity requires one.'
    ]
  },
  {
    name: 'European Accessibility Act / EN 301 549',
    scope: 'Accessible ICT products and services, including web software and procurement-oriented accessibility requirements.',
    currentSupport: [
      'The frontend includes skip navigation, semantic landmarks, labeled inputs, focus-visible outlines, and reduced-motion support.',
      'Dynamic status areas use ARIA live regions, and the 3D viewer includes a text table alternative.',
      'Interactive workflows are built with keyboard-reachable native controls.'
    ],
    ownerActions: [
      'Run an EN 301 549 v3.2.1 / WCAG 2.1 AA audit before public deployment.',
      'Publish an accessibility statement with known limitations and a feedback path.',
      'Retest any locally customized UI, charts, maps, or uploaded content.'
    ]
  },
  {
    name: 'EU AI Act',
    scope: 'Risk classification, transparency, human oversight, logging, accuracy, robustness, cybersecurity, and documentation for AI systems.',
    currentSupport: [
      'AI requests are routed through a backend gateway rather than directly from the browser to model services.',
      'The predictor validates coordinates and guards against non-finite model outputs.',
      'The current guidance service is deterministic and does not call an external hosted LLM.',
      'The README identifies prototype limitations, including the untrained fallback model behavior.'
    ],
    ownerActions: [
      'Classify the deployed use case under the AI Act before using outputs for real decisions.',
      'Document model provenance, intended use, validation data, limitations, human review, and monitoring.',
      'Label AI-assisted outputs clearly and avoid treating planning estimates as final engineering decisions.'
    ]
  },
  {
    name: 'NIS2 Directive',
    scope: 'Cybersecurity risk management and incident reporting for covered essential or important entities.',
    currentSupport: [
      'The stack includes rate limiting, CORS configuration, JWT-based access control, account lockout, and audit logging.',
      'Docker Compose uses service health checks, isolated service networking, PostgreSQL, Redis, and an NGINX gateway.',
      'NGINX includes security headers and a documented HTTPS/TLS configuration path.'
    ],
    ownerActions: [
      'Determine whether the deploying organization is in scope for NIS2 under the applicable Member State law.',
      'Operate vulnerability management, backup, incident response, supplier-risk, and reporting processes outside the app.',
      'Harden secrets, TLS, monitoring, logging retention, and administrative access before production use.'
    ]
  },
  {
    name: 'Cyber Resilience Act',
    scope: 'Cybersecurity requirements for software and hardware products with digital elements made available on the EU market.',
    currentSupport: [
      'The repository is inspectable, self-hostable, and includes Dockerfiles, dependency manifests, tests, and deployment configuration.',
      'Security-related defaults include API rate limits, account lockout, JWT settings, CORS controls, and security headers.',
      'The Apache 2.0 license allows modification and redistribution under its terms.'
    ],
    ownerActions: [
      'Assess whether a specific distribution is in scope as a product with digital elements.',
      'Maintain vulnerability handling, security update, SBOM/dependency review, and secure development records.',
      'Prepare product documentation and conformity evidence if the software is placed on the EU market.'
    ]
  }
]

const usPublicSectorStandards = [
  {
    name: 'Section 508 / WCAG 2.1 AA',
    scope: 'Accessible federal/public-sector ICT and web content for users with disabilities.',
    currentSupport: [
      'The frontend keeps skip-to-content navigation, semantic landmarks, visible focus states, labeled form controls, and reduced-motion support.',
      'Status messages, chat, prediction results, upload feedback, and collaboration feeds use ARIA live regions where dynamic updates occur.',
      'The 3D energy viewer includes a tabular text alternative for the sample visualized data.'
    ],
    ownerActions: [
      'Run a Section 508 and WCAG 2.1 AA audit before public-sector deployment.',
      'Test keyboard navigation, screen reader behavior, color contrast, reflow, error identification, and non-text alternatives.',
      'Publish an accessibility statement and remediation plan for any known gaps.'
    ]
  },
  {
    name: 'NIST SP 800-53 Control Posture',
    scope: 'Security and privacy control families commonly used by US federal, research, education, and grant-funded systems.',
    currentSupport: [
      'Authentication includes account lockout behavior aligned with AC-7-style controls.',
      'JWT access and refresh token lifetimes support session-management review similar to AC-12 expectations.',
      'Audit logging for authentication and privacy events supports AU-2/AU-3-style traceability.',
      'NGINX security headers, TLS configuration notes, rate limiting, and CORS controls support SC-7 and related boundary-protection work.',
      'PostgreSQL pgcrypto/data-checksum notes and secret-strength guidance support SC-28 and IA-5-oriented hardening.'
    ],
    ownerActions: [
      'Map the deployment to a selected NIST baseline and document inherited, implemented, and not-applicable controls.',
      'Complete access control, incident response, configuration management, contingency planning, and vulnerability management procedures outside the codebase.',
      'Review logs, secrets, backup, monitoring, and administrative workflows before production use.'
    ]
  },
  {
    name: 'NIST Cybersecurity Framework',
    scope: 'Operational cybersecurity governance across identify, protect, detect, respond, and recover functions.',
    currentSupport: [
      'The repository provides a deployable architecture, health checks, security headers, authentication controls, and audit-oriented events.',
      'Docker Compose, NGINX, PostgreSQL, Redis, backend services, and tests give teams a concrete system to assess and harden.'
    ],
    ownerActions: [
      'Create an asset inventory and define risk ownership for the deployment.',
      'Add monitoring, alerting, backup restoration drills, incident playbooks, and vulnerability review cadence.',
      'Document recovery objectives and service continuity expectations for mission-driven users.'
    ]
  },
  {
    name: 'FedRAMP Readiness',
    scope: 'Cloud security authorization expectations for US federal cloud services.',
    currentSupport: [
      'The repository includes implementation pieces that can support later security documentation, such as auth, audit events, deployment configuration, and test coverage.'
    ],
    ownerActions: [
      'Do not represent this project as FedRAMP authorized or ready without a formal assessment.',
      'If federal cloud use is planned, prepare a system security plan, control implementation statements, continuous monitoring plan, and third-party assessment path.'
    ]
  }
]

const officialReferences = [
  {
    label: 'European Commission: GDPR data protection rules',
    href: 'https://commission.europa.eu/law/law-topic/data-protection/eu-data-protection-rules_en'
  },
  {
    label: 'European Commission: European Accessibility Act',
    href: 'https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en'
  },
  {
    label: 'European Commission: Web Accessibility Directive standards and EN 301 549',
    href: 'https://digital-strategy.ec.europa.eu/en/policies/web-accessibility-directive-standards-and-harmonisation'
  },
  {
    label: 'European Commission: AI Act',
    href: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai'
  },
  {
    label: 'European Commission: NIS2 Directive',
    href: 'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive'
  },
  {
    label: 'European Commission: Cyber Resilience Act',
    href: 'https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act'
  },
  {
    label: 'Section508.gov: IT Accessibility Laws and Policies',
    href: 'https://www.section508.gov/manage/laws-and-policies/'
  },
  {
    label: 'NIST SP 800-53 Rev. 5',
    href: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final'
  },
  {
    label: 'NIST Cybersecurity Framework',
    href: 'https://www.nist.gov/cyberframework'
  },
  {
    label: 'FedRAMP: Get Authorized',
    href: 'https://www.fedramp.gov/cloud-service-providers/'
  }
]

function Compliance() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Compliance</h1>
        <p className="text-slate-700 max-w-4xl">
          EnergyEquityGrid includes compliance-oriented controls for privacy, accessibility,
          AI governance, and cybersecurity. This page describes the current implementation
          posture and the deployment responsibilities that remain with each organization
          running or modifying the software.
        </p>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This page is an implementation aid, not legal advice or a certification. Teams
          deploying EnergyEquityGrid in the EU, EEA, US public sector, or grant-funded
          environments should complete their own legal, accessibility, security, and
          AI-governance review.
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-8" aria-labelledby="european-standards-heading">
        <div className="mb-6">
          <h2 id="european-standards-heading" className="text-2xl font-bold">
            European Standards
          </h2>
          <p className="mt-2 text-slate-600">
            The items below map major European regulatory and standards areas to
            controls already present in the repository and actions required before
            production or public-sector use.
          </p>
        </div>

        <div className="space-y-5">
          {europeanStandards.map((standard) => (
            <article key={standard.name} className="rounded-lg border border-slate-200 p-5">
              <h3 className="text-xl font-semibold text-slate-900">{standard.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{standard.scope}</p>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <h4 className="font-semibold text-slate-800">Repository Support</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                    {standard.currentSupport.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800">Deployment Responsibilities</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                    {standard.ownerActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-8" aria-labelledby="us-standards-heading">
        <div className="mb-6">
          <h2 id="us-standards-heading" className="text-2xl font-bold">
            US / Public Sector Standards
          </h2>
          <p className="mt-2 text-slate-600">
            The repository also keeps a US public-sector compliance posture for
            accessibility, NIST security controls, and federal cloud-readiness planning.
          </p>
        </div>

        <div className="space-y-5">
          {usPublicSectorStandards.map((standard) => (
            <article key={standard.name} className="rounded-lg border border-slate-200 p-5">
              <h3 className="text-xl font-semibold text-slate-900">{standard.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{standard.scope}</p>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <h4 className="font-semibold text-slate-800">Repository Support</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                    {standard.currentSupport.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800">Deployment Responsibilities</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                    {standard.ownerActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-8" aria-labelledby="official-references-heading">
        <h2 id="official-references-heading" className="text-2xl font-bold">
          Official References
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {officialReferences.map((reference) => (
            <li key={reference.href}>
              <a
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                {reference.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow p-8" aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className="text-2xl font-bold">
          Deployment Checklist
        </h2>
        <p className="mt-3 text-slate-700">
          A practical repository checklist is available for teams preparing an EU/EEA-facing,
          public-interest, research, or production deployment.
        </p>
        <a
          href="https://github.com/sekacorn/EnergyEquityGrid/blob/main/docs/compliance-checklist.md"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
        >
          Open Compliance Checklist
        </a>
      </section>
    </div>
  )
}

export default Compliance
