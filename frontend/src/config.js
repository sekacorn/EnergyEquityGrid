export const API_BASE_PREDICTOR = import.meta.env.VITE_API_PREDICTOR ?? 'http://localhost:8083'
export const API_BASE_LLM = import.meta.env.VITE_API_LLM ?? 'http://localhost:8084'
export const API_BASE_SESSION = import.meta.env.VITE_API_SESSION ?? 'http://localhost:8082'
export const API_BASE_INTEGRATOR = import.meta.env.VITE_API_INTEGRATOR ?? 'http://localhost:8081'
export const API_BASE_AI = import.meta.env.VITE_API_AI ?? API_BASE_INTEGRATOR
export const API_BASE_AUTH = import.meta.env.VITE_API_AUTH ?? API_BASE_INTEGRATOR
export const WS_BASE_COLLAB = import.meta.env.VITE_WS_COLLAB ?? 'ws://localhost:8081/ws/collaborate'

// Warn in development if critical env vars are using fallback defaults
if (import.meta.env.DEV) {
  const expected = [
    ['VITE_API_AI', import.meta.env.VITE_API_AI],
    ['VITE_API_INTEGRATOR', import.meta.env.VITE_API_INTEGRATOR],
    ['VITE_API_SESSION', import.meta.env.VITE_API_SESSION],
    ['VITE_WS_COLLAB', import.meta.env.VITE_WS_COLLAB],
  ]
  const missing = expected.filter(([, val]) => !val).map(([name]) => name)
  if (missing.length > 0) {
    console.warn(
      `[EnergyEquityGrid] Using localhost defaults for: ${missing.join(', ')}. ` +
      'Set these in .env or .env.local for non-local environments.'
    )
  }
}
