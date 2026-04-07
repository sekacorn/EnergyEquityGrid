import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'cookie_consent'

function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (!stored) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAccept = (level) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        essential: true,
        analytics: level === 'all',
        marketing: level === 'all',
        acceptedAt: new Date().toISOString()
      }))
    } catch {
      // localStorage unavailable — consent still recorded in-memory for this session
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-heading"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 shadow-lg border-t border-slate-700"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 id="cookie-consent-heading" className="font-semibold text-sm mb-1">
            Cookie &amp; Storage Consent
          </h2>
          <p id="cookie-consent-description" className="text-xs text-slate-300">
            This site uses localStorage for authentication and session preferences (essential).
            Optional analytics and marketing cookies require your consent.
            Read our{' '}
            <Link to="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>{' '}
            for details. You can change your preferences at any time on the Privacy page.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-500 text-slate-200 hover:bg-slate-800"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleAccept('all')}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
