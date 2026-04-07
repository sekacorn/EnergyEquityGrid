import { useState } from 'react'
import { toast } from 'react-toastify'
import { API_BASE_AUTH } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'

function Privacy({ user }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState('')
  const [consentPrefs, setConsentPrefs] = useState({
    marketing: false,
    analytics: false
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const userId = user?.id

  const handleAccessData = async () => {
    if (!userId) {
      toast.error('You must be logged in to access your data.')
      return
    }
    setLoading('access')
    try {
      const response = await apiRequest(`${API_BASE_AUTH}/api/auth/gdpr/access/${userId}`)
      if (response.success) {
        setUserData(response.data)
        if (response.data) {
          setConsentPrefs({
            marketing: response.data.consentMarketing || false,
            analytics: response.data.consentAnalytics || false
          })
        }
        toast.success('Your data has been retrieved.')
      } else {
        toast.error(response.message || 'Could not retrieve data.')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to retrieve your data.'))
    } finally {
      setLoading('')
    }
  }

  const handleExportData = async () => {
    if (!userId) return
    setLoading('export')
    try {
      const response = await apiRequest(`${API_BASE_AUTH}/api/auth/gdpr/export/${userId}`)
      if (response.success) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `energyequitygrid-data-${user.username}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Your data export has been downloaded.')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to export your data.'))
    } finally {
      setLoading('')
    }
  }

  const handleDeleteRequest = async () => {
    if (!userId) return
    setLoading('delete')
    try {
      const response = await apiRequest(`${API_BASE_AUTH}/api/auth/gdpr/delete/${userId}`, {
        method: 'POST'
      })
      if (response.success) {
        toast.success(response.message)
        setShowDeleteConfirm(false)
      } else {
        toast.error(response.message || 'Unable to process deletion request.')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to process deletion request.'))
    } finally {
      setLoading('')
    }
  }

  const handleConsentChange = async (consentType, granted) => {
    if (!userId) return
    try {
      const response = await apiRequest(`${API_BASE_AUTH}/api/auth/gdpr/consent/${userId}`, {
        method: 'POST',
        body: { consentType, granted: String(granted) }
      })
      if (response.success) {
        setConsentPrefs(prev => ({ ...prev, [consentType]: granted }))
        toast.success(`${consentType.replace('_', ' ')} consent ${granted ? 'granted' : 'revoked'}.`)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update consent.'))
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-6">
          Last updated: April 2026. This policy complies with the EU General Data Protection Regulation (GDPR).
        </p>

        <div className="prose max-w-none text-slate-700 space-y-4">
          <h2 className="text-xl font-semibold">1. Data Controller</h2>
          <p>
            EnergyEquityGrid is the data controller for personal data collected through this platform.
            For any privacy inquiries, contact the data protection team at the email listed in the footer.
          </p>

          <h2 className="text-xl font-semibold">2. What Data We Collect (Art. 13/14)</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Account information: username, email address, hashed password</li>
            <li>Authentication data: login timestamps, MFA status, session tokens</li>
            <li>Usage data: uploaded energy/community/infrastructure datasets</li>
            <li>Collaboration data: planning notes shared in collaboration sessions</li>
            <li>Technical data: IP address and user agent (for security audit logs)</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Legal Basis for Processing (Art. 6)</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Consent (Art. 6(1)(a)):</strong> Marketing communications and analytics tracking</li>
            <li><strong>Contract (Art. 6(1)(b)):</strong> Account management and platform functionality</li>
            <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> Security logging and fraud prevention</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Your Rights</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Right of access (Art. 15):</strong> Request a copy of all personal data we hold about you</li>
            <li><strong>Right to data portability (Art. 20):</strong> Export your data in a machine-readable JSON format</li>
            <li><strong>Right to erasure (Art. 17):</strong> Request deletion of your account and all associated data</li>
            <li><strong>Right to withdraw consent (Art. 7):</strong> Revoke any optional consent at any time</li>
            <li><strong>Right to rectification (Art. 16):</strong> Request correction of inaccurate data</li>
            <li><strong>Right to lodge a complaint:</strong> You may file a complaint with your national data protection authority</li>
          </ul>

          <h2 className="text-xl font-semibold">5. Data Retention (Art. 5(1)(e))</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Account data: retained while the account is active, deleted 30 days after a deletion request</li>
            <li>Session data: expired sessions are purged after 90 days</li>
            <li>Audit logs: retained for 2 years for security compliance, then purged</li>
            <li>Consent records: retained for the lifetime of the account plus 3 years</li>
          </ul>

          <h2 className="text-xl font-semibold">6. Data Security (Art. 32)</h2>
          <p>
            We implement appropriate technical and organisational measures including TLS encryption
            in transit, bcrypt password hashing, database encryption at rest, and role-based access
            control to protect your personal data.
          </p>

          <h2 className="text-xl font-semibold">7. International Transfers (Art. 44-49)</h2>
          <p>
            If your data is processed outside the EEA, we ensure adequate safeguards are in place
            through Standard Contractual Clauses or equivalent mechanisms.
          </p>
        </div>
      </div>

      {user && (
        <>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Manage Your Consent</h2>
            <p className="text-slate-600 mb-6">
              You can grant or revoke optional consent at any time. Data processing consent is required for account functionality.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium">Data Processing</p>
                  <p className="text-sm text-slate-500">Required for account functionality. Cannot be revoked while your account is active.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  Granted
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <label htmlFor="consent-marketing" className="font-medium">Marketing Communications</label>
                  <p className="text-sm text-slate-500">Receive updates about new features and energy planning resources.</p>
                </div>
                <button
                  id="consent-marketing"
                  type="button"
                  onClick={() => handleConsentChange('marketing', !consentPrefs.marketing)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${
                    consentPrefs.marketing
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  aria-pressed={consentPrefs.marketing}
                >
                  {consentPrefs.marketing ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <label htmlFor="consent-analytics" className="font-medium">Analytics</label>
                  <p className="text-sm text-slate-500">Help us improve the platform by allowing usage analytics.</p>
                </div>
                <button
                  id="consent-analytics"
                  type="button"
                  onClick={() => handleConsentChange('analytics', !consentPrefs.analytics)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${
                    consentPrefs.analytics
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  aria-pressed={consentPrefs.analytics}
                >
                  {consentPrefs.analytics ? 'Granted' : 'Revoked'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Your Data Rights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={handleAccessData}
                disabled={loading === 'access'}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
              >
                <h3 className="font-semibold mb-1">View My Data</h3>
                <p className="text-sm text-slate-600">See all personal data we hold about you (Art. 15).</p>
                {loading === 'access' && <p className="text-sm text-emerald-700 mt-2">Loading...</p>}
              </button>

              <button
                type="button"
                onClick={handleExportData}
                disabled={loading === 'export'}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
              >
                <h3 className="font-semibold mb-1">Export My Data</h3>
                <p className="text-sm text-slate-600">Download your data as a JSON file (Art. 20).</p>
                {loading === 'export' && <p className="text-sm text-emerald-700 mt-2">Exporting...</p>}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-4 border border-red-200 rounded-lg hover:bg-red-50 text-left"
              >
                <h3 className="font-semibold text-red-700 mb-1">Delete My Data</h3>
                <p className="text-sm text-slate-600">Request permanent deletion of your account (Art. 17).</p>
              </button>
            </div>

            {showDeleteConfirm && (
              <div role="alertdialog" aria-labelledby="delete-confirm-title" className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 id="delete-confirm-title" className="font-bold text-red-800 mb-2">Confirm Account Deletion</h3>
                <p className="text-sm text-red-700 mb-4">
                  This will deactivate your account immediately and permanently delete all your data after 30 days.
                  You can contact support within that period to cancel.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteRequest}
                    disabled={loading === 'delete'}
                    className="px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700"
                  >
                    {loading === 'delete' ? 'Processing...' : 'Yes, Delete My Data'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-md font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {userData && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Your Personal Data</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <caption className="sr-only">Personal data held for your account</caption>
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th scope="col" className="py-2 pr-4 font-semibold">Field</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(userData)
                      .filter(([key]) => key !== 'consentHistory')
                      .map(([key, value]) => (
                        <tr key={key} className="border-b border-slate-100">
                          <td className="py-2 pr-4 font-medium text-slate-700">{key}</td>
                          <td className="py-2 pr-4 text-slate-600">
                            {value === null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {userData.consentHistory && userData.consentHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Consent History</h3>
                  <table className="min-w-full text-sm">
                    <caption className="sr-only">History of consent changes</caption>
                    <thead>
                      <tr className="text-left border-b border-slate-200">
                        <th scope="col" className="py-2 pr-4">Type</th>
                        <th scope="col" className="py-2 pr-4">Status</th>
                        <th scope="col" className="py-2 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.consentHistory.map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-2 pr-4">{entry.consentType}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.granted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.granted ? 'Granted' : 'Revoked'}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-slate-600">
                            {new Date(entry.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!user && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-slate-600">
            Log in to manage your consent preferences and exercise your data rights.
          </p>
        </div>
      )}
    </div>
  )
}

export default Privacy
