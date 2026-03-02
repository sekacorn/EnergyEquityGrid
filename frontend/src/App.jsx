import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Explore from './pages/Explore'
import Collaborate from './pages/Collaborate'
import Troubleshoot from './pages/Troubleshoot'

function App() {
  const [user, setUser] = useState(null)
  const [mbtiType, setMbtiType] = useState(
    localStorage.getItem('mbtiType') || 'UNKNOWN'
  )

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const getMbtiClass = () => {
    return `mbti-${mbtiType.toLowerCase()}`
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className={`shadow-lg ${getMbtiClass()}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold flex items-center">
                  ⚡ EnergyEquityGrid
                </Link>
                <div className="hidden md:ml-10 md:flex md:space-x-8">
                  <Link to="/" className="px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-20">
                    Home
                  </Link>
                  <Link to="/analyze" className="px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-20">
                    Analyze
                  </Link>
                  <Link to="/explore" className="px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-20">
                    Explore 3D
                  </Link>
                  <Link to="/collaborate" className="px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-20">
                    Collaborate
                  </Link>
                  <Link to="/troubleshoot" className="px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-20">
                    Troubleshoot
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={mbtiType}
                  onChange={(e) => {
                    setMbtiType(e.target.value)
                    localStorage.setItem('mbtiType', e.target.value)
                    window.location.reload()
                  }}
                  className="px-3 py-1 rounded bg-white bg-opacity-20 text-white border border-white border-opacity-30"
                >
                  <option value="UNKNOWN">Select MBTI</option>
                  <option value="ENTJ">ENTJ - Commander</option>
                  <option value="INFP">INFP - Mediator</option>
                  <option value="INFJ">INFJ - Advocate</option>
                  <option value="ESTP">ESTP - Entrepreneur</option>
                  <option value="INTJ">INTJ - Mastermind</option>
                  <option value="INTP">INTP - Thinker</option>
                  <option value="ISTJ">ISTJ - Logistician</option>
                  <option value="ESFJ">ESFJ - Consul</option>
                  <option value="ISFP">ISFP - Adventurer</option>
                  <option value="ENTP">ENTP - Debater</option>
                  <option value="ISFJ">ISFJ - Defender</option>
                  <option value="ESFP">ESFP - Entertainer</option>
                  <option value="ENFJ">ENFJ - Protagonist</option>
                  <option value="ESTJ">ESTJ - Executive</option>
                  <option value="ISTP">ISTP - Virtuoso</option>
                </select>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {user.username} ({user.roles.join(', ')})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home mbtiType={mbtiType} />} />
            <Route path="/analyze" element={<Analyze mbtiType={mbtiType} user={user} />} />
            <Route path="/explore" element={<Explore mbtiType={mbtiType} />} />
            <Route path="/collaborate" element={<Collaborate mbtiType={mbtiType} user={user} />} />
            <Route path="/troubleshoot" element={<Troubleshoot mbtiType={mbtiType} />} />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <ToastContainer position="bottom-right" />

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm">
                EnergyEquityGrid &copy; 2025 | Contact: Sekacorn@gmail.com
              </p>
              <p className="text-xs mt-2 text-gray-400">
                Licensed under Dual License: Free for non-profit use | 6% gross income for commercial use
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
