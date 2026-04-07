import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_AUTH } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('demo.admin')
  const [password, setPassword] = useState('mock-password')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await apiRequest(`${API_BASE_AUTH}/api/auth/login`, {
        method: 'POST',
        body: {
          username,
          password
        }
      })

      onLogin(response.user, response.token)
      navigate('/')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to sign in.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-slate-600 mb-6">
        This local screenshot environment uses a mock sign-in. The default demo credentials are prefilled.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-username" className="block text-sm font-medium text-slate-700 mb-2">
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            aria-describedby={errorMessage ? 'login-error' : undefined}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            aria-describedby={errorMessage ? 'login-error' : undefined}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {errorMessage && (
          <div
            id="login-error"
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default Login
