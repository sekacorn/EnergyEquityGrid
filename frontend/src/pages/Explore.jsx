import EnergyViewer from '../components/EnergyViewer'

function Explore() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-4">3D Energy Grid Visualization</h1>
        <p className="text-slate-600 mb-6">
          Explore renewable energy potential and infrastructure in interactive 3D.
          You can use a mouse to rotate, pan, and zoom, and an accessible data summary is provided below the viewer.
        </p>
        <EnergyViewer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Solar Potential</h3>
          <div className="text-3xl font-bold text-yellow-600">850+ kW</div>
          <p className="text-sm text-slate-600">Average capacity</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Wind Potential</h3>
          <div className="text-3xl font-bold text-blue-700">680+ kW</div>
          <p className="text-sm text-slate-600">Average capacity</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Locations Analyzed</h3>
          <div className="text-3xl font-bold text-emerald-700">5</div>
          <p className="text-sm text-slate-600">Data points</p>
        </div>
      </div>
    </div>
  )
}

export default Explore
