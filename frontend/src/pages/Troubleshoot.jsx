import { useState } from 'react'
import axios from 'axios'

function Troubleshoot({ mbtiType }) {
  const [issue, setIssue] = useState('')
  const [solution, setSolution] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTroubleshoot = async () => {
    if (!issue.trim()) return

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8084/troubleshoot', {
        query: issue,
        mbti_type: mbtiType
      })

      setSolution(response.data)
    } catch (error) {
      console.error('Troubleshooting error:', error)
      setSolution({
        issue_type: 'error',
        solution: 'Unable to connect to troubleshooting service. Please check if services are running.',
        next_steps: ['Check backend services', 'Verify network connection', 'Review logs']
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Troubleshooting Support</h1>
        <p className="text-gray-600 mb-6">
          Describe your issue and get MBTI-tailored guidance to resolve it.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your issue
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g., I'm having trouble uploading my CSV file..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleTroubleshoot}
            disabled={loading || !issue.trim()}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
              loading || !issue.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : `mbti-${mbtiType.toLowerCase()} hover:opacity-90`
            }`}
          >
            {loading ? 'Analyzing...' : 'Get Help'}
          </button>
        </div>
      </div>

      {solution && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Solution</h2>

          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Issue Type:</div>
            <div className="font-semibold capitalize">{solution.issue_type.replace('_', ' ')}</div>
          </div>

          <div className="mb-4">
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: solution.solution.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>

          {solution.next_steps && solution.next_steps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-1">
                {solution.next_steps.map((step, idx) => (
                  <li key={idx} className="text-gray-700">{step}</li>
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
