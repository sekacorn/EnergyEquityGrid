import { memo, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cone } from '@react-three/drei'

const EnergyPoint = memo(function EnergyPoint({ position, type, potential }) {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  const getColor = () => {
    if (type === 'solar') return '#facc15'
    if (type === 'wind') return '#2563eb'
    if (type === 'hydro') return '#06b6d4'
    return '#16a34a'
  }

  const getScale = () => Math.max(0.5, Math.min(3, potential / 500))

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
})

function Grid() {
  return <gridHelper args={[100, 50, '#888888', '#444444']} />
}

function EnergyViewer({ energyData = [] }) {
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSceneReady(true), 300)
    return () => window.clearTimeout(timer)
  }, [])

  const convertToPosition = (lat, lon, index) => {
    const x = (lon / 180) * 50
    const y = index * 0.5
    const z = (lat / 90) * 50
    return [x, y, z]
  }

  const sampleData = energyData.length > 0
    ? energyData
    : [
        { id: 1, latitude: 40.7128, longitude: -74.006, energyType: 'solar', potential: 850, source: 'NREL' },
        { id: 2, latitude: 34.0522, longitude: -118.2437, energyType: 'solar', potential: 920, source: 'NREL' },
        { id: 3, latitude: 51.5074, longitude: -0.1278, energyType: 'wind', potential: 650, source: 'IRENA' },
        { id: 4, latitude: -33.8688, longitude: 151.2093, energyType: 'solar', potential: 880, source: 'NREL' },
        { id: 5, latitude: 35.6762, longitude: 139.6503, energyType: 'wind', potential: 720, source: 'IRENA' }
      ]

  return (
    <section aria-labelledby="energy-viewer-heading" className="space-y-4">
      <h2 id="energy-viewer-heading" className="sr-only">Energy viewer</h2>

      <div
        className="w-full h-[50vh] min-h-[300px] bg-slate-900 rounded-lg overflow-hidden relative"
        role="img"
        aria-label="Interactive 3D energy map showing sample solar and wind sites with different energy potential values."
      >
        {!sceneReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 text-white">
            <div className="text-center">
              <div aria-hidden="true" className="mx-auto h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
              <p className="mt-4 text-sm">Loading 3D scene...</p>
            </div>
          </div>
        )}

        <Canvas camera={{ position: [30, 30, 30], fov: 60 }} onCreated={() => setSceneReady(true)}>
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

          <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2} />
        </Canvas>

        <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Energy Types</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div aria-hidden="true" className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
              <span>Solar</span>
            </div>
            <div className="flex items-center">
              <div aria-hidden="true" className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
              <span>Wind</span>
            </div>
            <div className="flex items-center">
              <div aria-hidden="true" className="w-4 h-4 rounded-full bg-cyan-500 mr-2"></div>
              <span>Hydro</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/90 p-4 rounded-lg shadow">
          <div className="text-sm text-slate-700">
            <p className="font-semibold mb-2">Controls:</p>
            <p>Left click + drag: rotate</p>
            <p>Right click + drag: pan</p>
            <p>Scroll: zoom</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Accessible Data Summary</h3>
        <p className="text-sm text-slate-700 mb-3">
          This table provides a text equivalent for the sample sites displayed in the 3D viewer.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Sample renewable energy locations shown in the 3D viewer</caption>
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th scope="col" className="py-2 pr-4">Source</th>
                <th scope="col" className="py-2 pr-4">Type</th>
                <th scope="col" className="py-2 pr-4">Latitude</th>
                <th scope="col" className="py-2 pr-4">Longitude</th>
                <th scope="col" className="py-2 pr-4">Potential</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((point) => (
                <tr key={point.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{point.source}</td>
                  <td className="py-2 pr-4 capitalize">{point.energyType}</td>
                  <td className="py-2 pr-4">{point.latitude}</td>
                  <td className="py-2 pr-4">{point.longitude}</td>
                  <td className="py-2 pr-4">{point.potential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default EnergyViewer
