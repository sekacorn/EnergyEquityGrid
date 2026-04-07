import { useState } from 'react'
import { toast } from 'react-toastify'
import DataUpload from '../components/DataUpload'
import { API_BASE_AI } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'

function Analyze() {
  const [predictions, setPredictions] = useState(null)
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    population: '1000',
    energy_type_preference: 'solar',
    has_grid_access: true
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePredict = async () => {
    const lat = parseFloat(formData.latitude)
    const lon = parseFloat(formData.longitude)
    const pop = parseInt(formData.population, 10)

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      const message = 'Please enter valid numeric latitude and longitude.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      const message = 'Latitude must be -90 to 90 and longitude -180 to 180.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    setLoading(true)
    setErrorMessage('')
    setStatusMessage('Generating predictions...')

    try {
      const response = await apiRequest(`${API_BASE_AI}/api/ai/predict`, {
        method: 'POST',
        body: {
          latitude: lat,
          longitude: lon,
          population: Number.isNaN(pop) ? 1000 : pop,
          energy_type_preference: formData.energy_type_preference,
          has_grid_access: formData.has_grid_access
        }
      })

      setPredictions(response)
      setStatusMessage('Predictions generated successfully.')
      toast.success('Predictions generated successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Error generating predictions.')
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Energy Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <DataUpload />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">AI Energy Predictions</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="analyze-latitude" className="block text-sm font-medium text-slate-700 mb-1">
                  Latitude
                </label>
                <input
                  id="analyze-latitude"
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="0.0001"
                  placeholder="e.g., 40.7128"
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={errorMessage ? 'analyze-error' : 'analyze-status'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div>
                <label htmlFor="analyze-longitude" className="block text-sm font-medium text-slate-700 mb-1">
                  Longitude
                </label>
                <input
                  id="analyze-longitude"
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="0.0001"
                  placeholder="e.g., -74.0060"
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={errorMessage ? 'analyze-error' : 'analyze-status'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="analyze-population" className="block text-sm font-medium text-slate-700 mb-1">
                Population
              </label>
              <input
                id="analyze-population"
                type="number"
                name="population"
                value={formData.population}
                onChange={handleInputChange}
                aria-describedby="analyze-status"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label htmlFor="analyze-energy-type" className="block text-sm font-medium text-slate-700 mb-1">
                Preferred Energy Type
              </label>
              <select
                id="analyze-energy-type"
                name="energy_type_preference"
                value={formData.energy_type_preference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="solar">Solar</option>
                <option value="wind">Wind</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="analyze-grid-access"
                type="checkbox"
                name="has_grid_access"
                checked={formData.has_grid_access}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="analyze-grid-access" className="text-sm text-slate-700">Has Grid Access</label>
            </div>

            <div id="analyze-status" aria-live="polite" className="text-sm text-slate-600">
              {statusMessage}
            </div>
            {errorMessage && (
              <div id="analyze-error" role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {loading ? 'Generating Predictions...' : 'Get AI Predictions'}
            </button>
          </div>
        </div>
      </div>

      {predictions && (
        <div className="bg-white rounded-xl shadow p-6" aria-live="polite">
          <h2 className="text-2xl font-bold mb-4">Recommended Solutions</h2>

          <div className="mb-4 p-4 bg-cyan-50 rounded-lg">
            <div className="text-lg font-semibold">
              Predicted Energy Demand: {predictions.predicted_demand?.toFixed(2) ?? 'N/A'} kW
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Confidence: {predictions.confidence_score != null ? (predictions.confidence_score * 100).toFixed(1) : 'N/A'}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(predictions.recommended_solutions) && predictions.recommended_solutions.map((solution, idx) => (
              <div key={solution.solution_type || idx} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 capitalize">
                  {(solution.solution_type || '').replace('_', ' ')}
                </h3>
                <p className="text-slate-700 mb-3">{solution.description}</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Capacity:</strong> {solution.estimated_capacity?.toFixed(0) ?? 'N/A'} kW
                  </div>
                  <div>
                    <strong>Cost:</strong> {solution.cost_estimate || 'N/A'}
                  </div>
                  <div>
                    <strong>Timeline:</strong> {solution.implementation_time || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analyze
