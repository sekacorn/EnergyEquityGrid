import { useState } from 'react'
import { API_BASE_AI } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'
import { renderSafeRichText } from '../utils/html'

function LLMChat() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      return
    }

    const userMessage = { role: 'user', content: query }
    setMessages((current) => [...current, userMessage])
    setLoading(true)
    setStatusMessage('Sending your question to the assistant.')

    try {
      const response = await apiRequest(`${API_BASE_AI}/api/ai/query`, {
        method: 'POST',
        body: {
          query,
          context: {}
        }
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions
      }

      setMessages((current) => [...current, assistantMessage])
      setQuery('')
      setStatusMessage('Assistant response received.')
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: getErrorMessage(error, 'Sorry, I ran into an error while processing your request.'),
        suggestions: []
      }
      setMessages((current) => [...current, errorMessage])
      setStatusMessage('Assistant response failed. An error message has been added to the chat.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion)
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 rounded-t-lg"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={loading}
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-8">
            <p className="text-lg font-semibold mb-2">Ask me anything about energy solutions.</p>
            <p className="text-sm">Examples:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>"How can I power my home with solar?"</li>
              <li>"What's the best renewable energy for my community?"</li>
              <li>"Explain microgrids in simple terms"</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              <div
                className={msg.role === 'user' ? 'text-white' : 'text-slate-800'}
                dangerouslySetInnerHTML={{ __html: renderSafeRichText(msg.content) }}
              />
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Suggestions:</p>
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-cyan-50 hover:bg-cyan-100 rounded border border-cyan-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div aria-hidden="true" className="flex space-x-2">
                <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="sr-only">Assistant is typing.</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-b-lg border-t border-slate-200">
        <label htmlFor="llm-chat-query" className="sr-only">
          Ask about energy solutions
        </label>
        <div className="flex space-x-2">
          <input
            id="llm-chat-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about energy solutions..."
            aria-describedby="llm-chat-status"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              loading || !query.trim()
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            Send
          </button>
        </div>
        <div id="llm-chat-status" aria-live="polite" className="mt-3 text-sm text-slate-600">
          {statusMessage}
        </div>
      </form>
    </div>
  )
}

export default LLMChat
