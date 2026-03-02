import { useState } from 'react'
import axios from 'axios'

function LLMChat({ mbtiType }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages([...messages, userMessage])
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8084/query', {
        query: query,
        mbti_type: mbtiType,
        context: {}
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        suggestions: response.data.suggestions
      }

      setMessages([...messages, userMessage, assistantMessage])
      setQuery('')
    } catch (error) {
      console.error('LLM query error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        suggestions: []
      }
      setMessages([...messages, userMessage, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion)
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-semibold mb-2">Ask me anything about energy solutions!</p>
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
                  ? `mbti-${mbtiType.toLowerCase()}`
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div
                className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Suggestions:</p>
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSuggestion(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
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
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-b-lg border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about energy solutions..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              loading || !query.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : `mbti-${mbtiType.toLowerCase()} hover:opacity-90`
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default LLMChat
