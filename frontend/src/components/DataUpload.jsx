import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

function DataUpload({ mbtiType, onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [dataType, setDataType] = useState('energy')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toLowerCase()
      if (['csv', 'json', 'geojson'].includes(extension)) {
        setFile(selectedFile)
        toast.info(`File selected: ${selectedFile.name}`)
      } else {
        toast.error('Please upload CSV, JSON, or GeoJSON files only')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const endpoint = `/api/data/upload/${dataType}`
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success(`Successfully uploaded ${response.data.recordsProcessed} records!`)
        setFile(null)
        if (onUploadSuccess) {
          onUploadSuccess(response.data)
        }
      } else {
        toast.error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const getMbtiGuidance = () => {
    const guidance = {
      ENTJ: 'Upload your data efficiently to start strategic analysis',
      INFP: 'Share your community energy data to make a positive impact',
      INFJ: 'Contribute data to help build a harmonious energy future',
      ESTP: 'Quick upload - let\'s get this data in and start solving problems!',
      INTJ: 'Systematic data integration for comprehensive analysis',
      DEFAULT: 'Upload energy, community, or infrastructure data'
    }
    return guidance[mbtiType] || guidance.DEFAULT
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Data Upload</h2>
      <p className="text-gray-600 mb-6">{getMbtiGuidance()}</p>

      {/* Data Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Type
        </label>
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="energy">Energy Data (IRENA, NREL)</option>
          <option value="community">Community Data (OpenStreetMap)</option>
          <option value="infrastructure">Infrastructure Data</option>
        </select>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File (CSV, JSON, or GeoJSON)
        </label>
        <input
          type="file"
          accept=".csv,.json,.geojson"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {file && (
          <p className="mt-2 text-sm text-green-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
          !file || uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : `mbti-${mbtiType.toLowerCase()} hover:opacity-90`
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Data'}
      </button>

      {/* Format Examples */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Expected Format Examples:</h3>
        <div className="text-sm space-y-2">
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
