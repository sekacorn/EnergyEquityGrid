import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Explore from './pages/Explore'
import Collaborate from './pages/Collaborate'
import Troubleshoot from './pages/Troubleshoot'
import Login from './pages/Login'
import Privacy from './pages/Privacy'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'

function App() {
  const [user, setUser] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navLinkClassName = ({ isActive }) => (
    `px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'hover:bg-white/10'}`
  )

  const mobileNavLinkClassName = ({ isActive }) => (
    `block px-3 py-2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'hover:bg-white/10'}`
  )

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed && parsed.username) {
          setUser(parsed)
        }
      }
    } catch {
      localStorage.removeItem('user')
    }
  }, [])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setMobileNavOpen(false)
  }

  const handleLogin = (nextUser, token) => {
    setUser(nextUser)
    localStorage.setItem('user', JSON.stringify(nextUser))
    localStorage.setItem('token', token)
    setMobileNavOpen(false)
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900"
        >
          Skip to main content
        </a>

        <nav className="shadow-lg bg-slate-900 text-white" aria-label="Primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold flex items-center">
                  EnergyEquityGrid
                </Link>
                <div className="hidden md:ml-10 md:flex md:space-x-8">
                  <NavLink to="/" end className={navLinkClassName}>Home</NavLink>
                  <NavLink to="/analyze" className={navLinkClassName}>Analyze</NavLink>
                  <NavLink to="/explore" className={navLinkClassName}>Explore 3D</NavLink>
                  <NavLink to="/collaborate" className={navLinkClassName}>Collaborate</NavLink>
                  <NavLink to="/troubleshoot" className={navLinkClassName}>Troubleshoot</NavLink>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="md:hidden px-3 py-2 rounded bg-white/10 hover:bg-white/20"
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-navigation"
                  aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  onClick={() => setMobileNavOpen((current) => !current)}
                >
                  Menu
                </button>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {user.username} ({Array.isArray(user.roles) ? user.roles.join(', ') : 'USER'})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
            {mobileNavOpen && (
              <div id="mobile-navigation" className="md:hidden border-t border-white/10 py-3 space-y-2">
                <NavLink to="/" end className={mobileNavLinkClassName} onClick={() => setMobileNavOpen(false)}>Home</NavLink>
                <NavLink to="/analyze" className={mobileNavLinkClassName} onClick={() => setMobileNavOpen(false)}>Analyze</NavLink>
                <NavLink to="/explore" className={mobileNavLinkClassName} onClick={() => setMobileNavOpen(false)}>Explore 3D</NavLink>
                <NavLink to="/collaborate" className={mobileNavLinkClassName} onClick={() => setMobileNavOpen(false)}>Collaborate</NavLink>
                <NavLink to="/troubleshoot" className={mobileNavLinkClassName} onClick={() => setMobileNavOpen(false)}>Troubleshoot</NavLink>
              </div>
            )}
          </div>
        </nav>

        <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" tabIndex={-1}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<Analyze user={user} />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/collaborate" element={<Collaborate user={user} />} />
              <Route path="/troubleshoot" element={<Troubleshoot />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/privacy" element={<Privacy user={user} />} />
            </Routes>
          </ErrorBoundary>
        </main>

        <ToastContainer position="bottom-right" />
        <CookieConsent />

        <footer className="bg-slate-900 text-white mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm">
                EnergyEquityGrid &copy; 2026
              </p>
              <p className="text-xs mt-2 text-slate-300">
                Licensed under Apache 2.0. Review deployment settings before production use.
              </p>
              <p className="text-xs mt-2">
                <Link to="/privacy" className="text-slate-300 hover:text-white underline">
                  Privacy Policy &amp; Data Rights (GDPR)
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
