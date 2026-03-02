import { useState } from 'react'
import LLMChat from '../components/LLMChat'

function Home({ mbtiType }) {
  const [showChat, setShowChat] = useState(false)

  const getMbtiWelcome = () => {
    const welcomes = {
      ENTJ: {
        title: "Strategic Energy Command Center",
        subtitle: "Optimize energy access with data-driven decisions",
        cta: "Start Strategic Analysis"
      },
      INFP: {
        title: "Sustainable Energy Vision",
        subtitle: "Create a better world through clean energy",
        cta: "Explore Creative Solutions"
      },
      INFJ: {
        title: "Holistic Energy Harmony",
        subtitle: "Build community-centered energy solutions",
        cta: "Discover Community Solutions"
      },
      ESTP: {
        title: "Energy Action Hub",
        subtitle: "Get quick wins with immediate solutions",
        cta: "Take Action Now"
      },
      INTJ: {
        title: "Energy System Architecture",
        subtitle: "Design comprehensive energy strategies",
        cta: "Analyze Systems"
      },
      DEFAULT: {
        title: "Welcome to EnergyEquityGrid",
        subtitle: "Democratizing access to clean and affordable energy",
        cta: "Get Started"
      }
    }
    return welcomes[mbtiType] || welcomes.DEFAULT
  }

  const welcome = getMbtiWelcome()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {welcome.title}
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          {welcome.subtitle}
        </p>
        <p className="text-lg text-gray-700 mb-8">
          EnergyEquityGrid integrates renewable energy data from IRENA and NREL,
          community data from OpenStreetMap, and infrastructure information to
          provide personalized AI-driven energy solutions with stunning 3D visualizations.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/analyze'}
            className={`px-6 py-3 rounded-lg font-semibold text-white mbti-${mbtiType.toLowerCase()}`}
          >
            {welcome.cta}
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-800"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* LLM Chat */}
      {showChat && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <LLMChat mbtiType={mbtiType} />
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Data Integration</h3>
          <p className="text-gray-600">
            Upload CSV, JSON, and GeoJSON data from IRENA, NREL, and OpenStreetMap
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">3D Visualization</h3>
          <p className="text-gray-600">
            Explore energy grids and renewable potential in interactive 3D
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
          <p className="text-gray-600">
            Get personalized energy solutions powered by PyTorch AI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
          <p className="text-gray-600">
            Ask questions in plain English with MBTI-tailored responses
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
          <p className="text-gray-600">
            Work together in real-time with communities and policymakers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Enterprise SSO</h3>
          <p className="text-gray-600">
            Secure authentication with Google, Azure, Okta SSO and MFA
          </p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Global Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">733M</div>
            <div className="text-lg">People without electricity access (IEA)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">16</div>
            <div className="text-lg">MBTI types supported</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-lg">Open Source</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
