import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cone } from '@react-three/drei'
import * as THREE from 'three'

function EnergyPoint({ position, type, potential }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  const getColor = () => {
    if (type === 'solar') return '#FFD700'
    if (type === 'wind') return '#4169E1'
    if (type === 'hydro') return '#00CED1'
    return '#32CD32'
  }

  const getScale = () => {
    return Math.max(0.5, Math.min(3, potential / 500))
  }

  return (
    <group position={position}>
      {type === 'solar' && (
        <Sphere ref={meshRef} args={[getScale(), 16, 16]}>
          <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.5} />
        </Sphere>
      )}
      {type === 'wind' && (
        <Cone ref={meshRef} args={[getScale(), getScale() * 2, 8]}>
          <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.5} />
        </Cone>
      )}
      {type !== 'solar' && type !== 'wind' && (
        <Box ref={meshRef} args={[getScale(), getScale(), getScale()]}>
          <meshStandardMaterial color={getColor()} />
        </Box>
      )}
    </group>
  )
}

function Grid() {
  return (
    <gridHelper args={[100, 50, '#888888', '#444444']} />
  )
}

function EnergyViewer({ energyData = [], mbtiType }) {
  const [selectedPoint, setSelectedPoint] = useState(null)

  // Convert lat/lon to 3D coordinates
  const convertToPosition = (lat, lon, index) => {
    const x = (lon / 180) * 50
    const y = index * 0.5 // Stack vertically for visibility
    const z = (lat / 90) * 50
    return [x, y, z]
  }

  // Sample data if none provided
  const sampleData = energyData.length > 0 ? energyData : [
    { id: 1, latitude: 40.7128, longitude: -74.0060, energyType: 'solar', potential: 850, source: 'NREL' },
    { id: 2, latitude: 34.0522, longitude: -118.2437, energyType: 'solar', potential: 920, source: 'NREL' },
    { id: 3, latitude: 51.5074, longitude: -0.1278, energyType: 'wind', potential: 650, source: 'IRENA' },
    { id: 4, latitude: -33.8688, longitude: 151.2093, energyType: 'solar', potential: 880, source: 'NREL' },
    { id: 5, latitude: 35.6762, longitude: 139.6503, energyType: 'wind', potential: 720, source: 'IRENA' },
  ]

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden relative">
      <Canvas camera={{ position: [30, 30, 30], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 50, 50]} intensity={1} />
        <pointLight position={[-50, -50, -50]} intensity={0.5} />

        <Grid />

        {sampleData.map((point, index) => (
          <EnergyPoint
            key={point.id || index}
            position={convertToPosition(point.latitude, point.longitude, index)}
            type={point.energyType}
            potential={point.potential}
          />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Energy Types</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
            <span>Solar</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
            <span>Wind</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2"></div>
            <span>Hydro</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg shadow">
        <div className="text-sm">
          <p className="font-semibold mb-2">Controls:</p>
          <p>• Left Click + Drag: Rotate</p>
          <p>• Right Click + Drag: Pan</p>
          <p>• Scroll: Zoom</p>
        </div>
      </div>
    </div>
  )
}

export default EnergyViewer
