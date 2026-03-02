import { useState } from 'react'
import DataUpload from '../components/DataUpload'
import axios from 'axios'
import { toast } from 'react-toastify'

function Analyze({ mbtiType, user }) {
  const [predictions, setPredictions] = useState(null)
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    population: '1000',
    energy_type_preference: 'solar',
    has_grid_access: true
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handlePredict = async () => {
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please enter latitude and longitude')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8083/predict', {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        population: parseInt(formData.population),
        energy_type_preference: formData.energy_type_preference,
        has_grid_access: formData.has_grid_access,
        mbti_type: mbtiType
      })

      setPredictions(response.data)
      toast.success('Predictions generated successfully!')
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Error generating predictions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Energy Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div>
          <DataUpload mbtiType={mbtiType} />
        </div>

        {/* Prediction Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">AI Energy Predictions</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="0.0001"
                  placeholder="e.g., 40.7128"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="0.0001"
                  placeholder="e.g., -74.0060"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Population
              </label>
              <input
                type="number"
                name="population"
                value={formData.population}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Energy Type
              </label>
              <select
                name="energy_type_preference"
                value={formData.energy_type_preference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solar">Solar</option>
                <option value="wind">Wind</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="has_grid_access"
                checked={formData.has_grid_access}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Has Grid Access</label>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `mbti-${mbtiType.toLowerCase()} hover:opacity-90`
              }`}
            >
              {loading ? 'Generating Predictions...' : 'Get AI Predictions'}
            </button>
          </div>
        </div>
      </div>

      {/* Predictions Results */}
      {predictions && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recommended Solutions</h2>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold">
              Predicted Energy Demand: {predictions.predicted_demand.toFixed(2)} kW
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Confidence: {(predictions.confidence_score * 100).toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.recommended_solutions.map((solution, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 capitalize">
                  {solution.solution_type.replace('_', ' ')}
                </h3>
                <p className="text-gray-700 mb-3">{solution.description}</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Capacity:</strong> {solution.estimated_capacity.toFixed(0)} kW
                  </div>
                  <div>
                    <strong>Cost:</strong> {solution.cost_estimate}
                  </div>
                  <div>
                    <strong>Timeline:</strong> {solution.implementation_time}
                  </div>
                  <div className={`mt-3 p-3 rounded bg-gray-50 mbti-${mbtiType.toLowerCase()} bg-opacity-10`}>
                    <strong>For {mbtiType}:</strong> {solution.mbti_tailored_advice}
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
