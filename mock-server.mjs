import http from 'node:http'
import { URL } from 'node:url'

const port = 8090
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])

function getOrigin(req) {
  const origin = req.headers.origin
  return allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:3000'
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getOrigin(res.req),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  })
  res.end(JSON.stringify(payload))
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({ rawBody: raw })
      }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': getOrigin(req),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    })
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/data/health') {
    sendJson(res, 200, { status: 'UP', service: 'mock-integrator' })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await collectBody(req)
    const username = body.username || 'demo.admin'

    sendJson(res, 200, {
      success: true,
      token: 'mock-token-123',
      user: {
        id: 1,
        username,
        email: `${username}@example.com`,
        roles: username.includes('admin') ? ['ADMIN', 'USER'] : ['USER'],
        mfaEnabled: false,
        isEnterpriseUser: true
      }
    })
    return
  }

  if (req.method === 'POST' && url.pathname.startsWith('/api/data/upload/')) {
    const dataType = url.pathname.split('/').pop()
    sendJson(res, 200, {
      success: true,
      recordsProcessed: dataType === 'community' ? 18 : dataType === 'infrastructure' ? 12 : 24,
      message: `${dataType} data uploaded successfully`
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/ai/predict') {
    const body = await collectBody(req)
    const baseDemand = Math.max(850, Number(body.population || 1000) * 0.18)
    sendJson(res, 200, {
      predicted_demand: baseDemand,
      confidence_score: 0.87,
      timestamp: new Date().toISOString(),
      recommended_solutions: [
        {
          solution_type: 'solar',
          description: 'Install a phased rooftop and community-solar rollout to cover daytime demand.',
          estimated_capacity: Math.round(baseDemand * 0.8),
          cost_estimate: '$920,000 - $1,260,000',
          implementation_time: '3-6 months'
        },
        {
          solution_type: 'microgrid',
          description: 'Deploy a battery-backed microgrid for resilience during outages and peak demand.',
          estimated_capacity: Math.round(baseDemand * 1.25),
          cost_estimate: '$1,450,000 - $1,980,000',
          implementation_time: '8-12 months'
        },
        {
          solution_type: 'grid_expansion',
          description: 'Extend distribution infrastructure to improve reliability for nearby underserved blocks.',
          estimated_capacity: Math.round(baseDemand),
          cost_estimate: '$1,100,000 - $1,600,000',
          implementation_time: '10-16 months'
        }
      ]
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/ai/query') {
    const body = await collectBody(req)
    const query = body.query || 'your energy plan'
    sendJson(res, 200, {
      response: `**Energy guidance:** A strong next step for "${query}" is to compare solar generation, storage, and microgrid resilience together. Start with site data, local load estimates, and financing constraints.`,
      suggestions: [
        'Compare solar and storage sizing',
        'Estimate neighborhood demand peaks',
        'Review resilience benefits of a microgrid'
      ],
      timestamp: new Date().toISOString()
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/ai/troubleshoot') {
    sendJson(res, 200, {
      issue_type: 'mock_support',
      solution: '**Troubleshooting:** Your screenshot environment is using mock services. If something looks off, refresh the page and try the action again.',
      next_steps: [
        'Retry the action once.',
        'Use smaller sample inputs if needed.',
        'Capture the screen after the response card appears.'
      ],
      timestamp: new Date().toISOString()
    })
    return
  }

  // GDPR endpoints
  if (req.method === 'GET' && url.pathname.match(/^\/api\/auth\/gdpr\/access\/\d+$/)) {
    sendJson(res, 200, {
      success: true,
      data: {
        id: 1,
        username: 'demo.admin',
        email: 'demo.admin@example.com',
        roles: ['ADMIN', 'USER'],
        organization: 'EnergyEquityGrid Demo',
        isEnterpriseUser: true,
        mfaEnabled: false,
        ssoProvider: null,
        createdAt: '2026-01-15T10:30:00',
        lastLogin: new Date().toISOString(),
        consentDataProcessing: true,
        consentDataProcessingAt: '2026-01-15T10:30:00',
        consentMarketing: false,
        consentMarketingAt: null,
        consentAnalytics: true,
        consentAnalyticsAt: '2026-02-20T14:00:00',
        privacyPolicyAcceptedAt: '2026-01-15T10:30:00',
        consentHistory: [
          { consentType: 'data_processing', granted: true, createdAt: '2026-01-15T10:30:00' },
          { consentType: 'privacy_policy', granted: true, createdAt: '2026-01-15T10:30:00' },
          { consentType: 'analytics', granted: true, createdAt: '2026-02-20T14:00:00' }
        ]
      }
    })
    return
  }

  if (req.method === 'GET' && url.pathname.match(/^\/api\/auth\/gdpr\/export\/\d+$/)) {
    sendJson(res, 200, {
      success: true,
      format: 'application/json',
      data: {
        id: 1,
        username: 'demo.admin',
        email: 'demo.admin@example.com',
        roles: ['ADMIN', 'USER'],
        createdAt: '2026-01-15T10:30:00',
        consentDataProcessing: true,
        consentMarketing: false,
        consentAnalytics: true
      }
    })
    return
  }

  if (req.method === 'POST' && url.pathname.match(/^\/api\/auth\/gdpr\/delete\/\d+$/)) {
    sendJson(res, 200, {
      success: true,
      message: 'Your data deletion request has been received. Your account has been deactivated and will be permanently deleted within 30 days. Contact support to cancel this request.'
    })
    return
  }

  if (req.method === 'POST' && url.pathname.match(/^\/api\/auth\/gdpr\/consent\/\d+$/)) {
    const body = await collectBody(req)
    sendJson(res, 200, {
      success: true,
      message: `Consent updated for ${body.consentType}`
    })
    return
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/collaboration/')) {
    sendJson(res, 200, {
      room: 'community-planning',
      participants: ['Guest Planner', 'Jordan', 'Mina'],
      updates: [
        {
          author: 'Jordan',
          content: 'Uploaded neighborhood energy demand estimates and outage hotspots.',
          timestamp: new Date().toISOString()
        },
        {
          author: 'Mina',
          content: 'Recommend prioritizing the school and clinic for backup storage.',
          timestamp: new Date().toISOString()
        }
      ]
    })
    return
  }

  sendJson(res, 404, { message: 'Not found' })
})

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`)
})
