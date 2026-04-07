import { useState } from 'react'
import { API_BASE_AI } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'
import { renderSafeRichText } from '../utils/html'

function Troubleshoot() {
  const [issue, setIssue] = useState('')
  const [solution, setSolution] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleTroubleshoot = async () => {
    if (!issue.trim()) {
      return
    }

    setLoading(true)
    setStatusMessage('Analyzing issue...')

    try {
      const response = await apiRequest(`${API_BASE_AI}/api/ai/troubleshoot`, {
        method: 'POST',
        body: {
          query: issue
        }
      })

      setSolution(response)
      setStatusMessage('Troubleshooting guidance is ready.')
    } catch (error) {
      setSolution({
        issue_type: 'error',
        solution: getErrorMessage(
          error,
          'Unable to connect to the troubleshooting service. Please try again later.'
        ),
        next_steps: ['Check that backend services are running.', 'Verify your network connection.', 'Review logs for recent errors.']
      })
      setStatusMessage('Unable to reach the troubleshooting service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Troubleshooting Support</h1>
        <p className="text-slate-600 mb-6">
          Describe your issue and get clear guidance to help you resolve it.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="troubleshoot-issue" className="block text-sm font-medium text-slate-700 mb-2">
              Describe your issue
            </label>
            <textarea
              id="troubleshoot-issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g., I'm having trouble uploading my CSV file..."
              aria-describedby="troubleshoot-status"
              className="w-full px-3 py-2 border border-slate-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div id="troubleshoot-status" aria-live="polite" className="text-sm text-slate-600">
            {statusMessage}
          </div>

          <button
            onClick={handleTroubleshoot}
            disabled={loading || !issue.trim()}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
              loading || !issue.trim()
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {loading ? 'Analyzing...' : 'Get Help'}
          </button>
        </div>
      </div>

      {solution && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Solution</h2>

          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Issue Type:</div>
            <div className="font-semibold capitalize">{solution.issue_type.replace('_', ' ')}</div>
          </div>

          <div className="mb-4">
            <div
              aria-live="polite"
              className="text-slate-800"
              dangerouslySetInnerHTML={{ __html: renderSafeRichText(solution.solution) }}
            />
          </div>

          {solution.next_steps && solution.next_steps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-1">
                {solution.next_steps.map((step, idx) => (
                  <li key={idx} className="text-slate-700">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Troubleshoot
