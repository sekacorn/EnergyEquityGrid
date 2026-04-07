import { useState } from 'react'
import { toast } from 'react-toastify'
import { API_BASE_INTEGRATOR } from '../config'
import { apiRequest, getErrorMessage } from '../utils/apiClient'

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['csv', 'json', 'geojson']
const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/json',
  'application/geo+json',
  'application/octet-stream'
]

function DataUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [dataType, setDataType] = useState('energy')
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) {
      return
    }

    const extension = selectedFile.name.split('.').pop().toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      const message = 'Please upload a CSV, JSON, or GeoJSON file.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      const message = 'Files larger than 100 MB are not supported.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    if (selectedFile.type && !ACCEPTED_MIME_TYPES.includes(selectedFile.type)) {
      const message = 'The selected file type is not supported.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    setFile(selectedFile)
    setErrorMessage('')
    setStatusMessage(`Selected file: ${selectedFile.name}`)
    toast.info(`File selected: ${selectedFile.name}`)
  }

  const handleUpload = async () => {
    if (!file) {
      const message = 'Please select a file first.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
      return
    }

    setUploading(true)
    setErrorMessage('')
    setStatusMessage('Uploading file...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiRequest(`${API_BASE_INTEGRATOR}/api/data/upload/${dataType}`, {
        method: 'POST',
        body: formData
      })

      if (response.success) {
        setStatusMessage(`Successfully uploaded ${response.recordsProcessed} records.`)
        toast.success(`Successfully uploaded ${response.recordsProcessed} records.`)
        setFile(null)
        if (onUploadSuccess) {
          onUploadSuccess(response)
        }
        return
      }

      const message = response.message || 'Upload failed.'
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
    } catch (error) {
      const message = getErrorMessage(error, 'Error uploading file.')
      setErrorMessage(message)
      setStatusMessage('')
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Data Upload</h2>
      <p className="text-slate-600 mb-6">
        Upload your community energy data to begin analysis.
      </p>

      <div className="mb-4">
        <label htmlFor="upload-data-type" className="block text-sm font-medium text-slate-700 mb-2">
          Data Type
        </label>
        <select
          id="upload-data-type"
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          aria-describedby="upload-status"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="energy">Energy Data (IRENA, NREL)</option>
          <option value="community">Community Data (OpenStreetMap)</option>
          <option value="infrastructure">Infrastructure Data</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="upload-file" className="block text-sm font-medium text-slate-700 mb-2">
          Select File (CSV, JSON, or GeoJSON)
        </label>
        <input
          id="upload-file"
          type="file"
          accept=".csv,.json,.geojson"
          onChange={handleFileChange}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? 'upload-error' : 'upload-status'}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
        {file && (
          <p className="mt-2 text-sm text-emerald-700">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div id="upload-status" aria-live="polite" className="mb-4 text-sm text-slate-600">
        {statusMessage}
      </div>
      {errorMessage && (
        <div id="upload-error" role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
          !file || uploading
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-emerald-700 hover:bg-emerald-800'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Data'}
      </button>

      <div className="mt-6 p-4 bg-slate-50 rounded-md">
        <h3 className="font-semibold mb-2">Expected Format Examples:</h3>
        <div className="text-sm space-y-2 text-slate-700">
          <div>
            <strong>Energy CSV:</strong> source, energyType, latitude, longitude, potential, currentCapacity
          </div>
          <div>
            <strong>Community CSV:</strong> communityName, latitude, longitude, population, energyDemand, hasGridAccess
          </div>
          <div>
            <strong>Infrastructure CSV:</strong> infrastructureType, latitude, longitude, capacity, status, owner
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataUpload
