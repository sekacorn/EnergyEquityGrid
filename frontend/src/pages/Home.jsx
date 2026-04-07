import { Link } from 'react-router-dom'
import { useState } from 'react'
import LLMChat from '../components/LLMChat'

function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to EnergyEquityGrid
        </h1>
        <p className="text-xl text-slate-600 mb-6">
          Democratizing access to clean and affordable energy.
        </p>
        <p className="text-lg text-slate-700 mb-8">
          EnergyEquityGrid integrates renewable energy, community, and infrastructure
          data to help teams explore options, generate AI-assisted recommendations, and
          understand local energy opportunities through interactive visual tools.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/analyze"
            className="px-6 py-3 rounded-lg font-semibold text-white bg-emerald-700 hover:bg-emerald-800"
          >
            Start Analysis
          </Link>
          <button
            onClick={() => setShowChat(!showChat)}
            aria-expanded={showChat}
            aria-controls="home-ai-chat"
            className="px-6 py-3 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-800"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>

      {showChat && (
        <div id="home-ai-chat" className="bg-white rounded-xl shadow-lg p-6">
          <LLMChat />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">Data</div>
          <h3 className="text-xl font-semibold mb-2">Data Integration</h3>
          <p className="text-slate-600">
            Upload CSV, JSON, and GeoJSON data from trusted energy and community sources.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">3D</div>
          <h3 className="text-xl font-semibold mb-2">3D Visualization</h3>
          <p className="text-slate-600">
            Explore energy grids and renewable potential in an interactive 3D viewer.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">AI</div>
          <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
          <p className="text-slate-600">
            Generate practical energy recommendations based on local demand and access.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">Chat</div>
          <h3 className="text-xl font-semibold mb-2">Natural Language Guidance</h3>
          <p className="text-slate-600">
            Ask questions in plain English about solar, wind, microgrids, and planning.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">Team</div>
          <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
          <p className="text-slate-600">
            Coordinate energy planning work across communities, NGOs, and policymakers.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div aria-hidden="true" className="text-3xl mb-4">Secure</div>
          <h3 className="text-xl font-semibold mb-2">Enterprise Access</h3>
          <p className="text-slate-600">
            Support secure user roles, MFA, and SSO-ready account management.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-700 to-cyan-700 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Global Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">733M</div>
            <div className="text-lg">People without electricity access (IEA)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">3</div>
            <div className="text-lg">Core workflows: analyze, explore, troubleshoot</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-lg">Open-source foundation</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
