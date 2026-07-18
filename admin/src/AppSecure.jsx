import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { apiFetch, AuthError } from './utils/api'
import UsersPage from './pages/UsersPage'
import PlansPage from './pages/PlansPage'
import UserPlansPage from './pages/UserPlansPage'
import WhatsAppPage from './pages/WhatsAppPage'
import SettingsPage from './pages/SettingsPage'
import InsuranceCompaniesPage from './pages/InsuranceCompaniesPage'

const initialLoginForm = {
  email: '',
  password: '',
}

function AppSecure() {
  const navigate = useNavigate()
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [loginState, setLoginState] = useState({
    checking: true,
    submitting: false,
    authenticated: false,
    admin: null,
    error: '',
  })

  const wrappedApiFetch = async (endpoint, options = {}) => {
    try {
      return await apiFetch(endpoint, options)
    } catch (error) {
      if (error instanceof AuthError) {
        handleLogout()
      }
      throw error
    }
  }

  const checkAdminAuth = async () => {
    try {
      const result = await apiFetch('/api/auth/admin/profile')
      setLoginState({
        checking: false,
        submitting: false,
        authenticated: true,
        admin: result.data?.admin || null,
        error: '',
      })
    } catch (error) {
      setLoginState((prev) => ({
        ...prev,
        checking: false,
        submitting: false,
        authenticated: false,
        admin: null,
        error: error instanceof AuthError ? '' : error.message || 'Failed to verify admin session',
      }))
    }
  }

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
    if (loginState.error) {
      setLoginState((prev) => ({ ...prev, error: '' }))
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      setLoginState((prev) => ({ ...prev, error: 'Email and password are required' }))
      return
    }
    try {
      setLoginState((prev) => ({ ...prev, submitting: true, error: '' }))
      const result = await apiFetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      if (!result.data?.admin) {
        await checkAdminAuth()
      } else {
        setLoginState({ checking: true, submitting: false, authenticated: false, admin: null, error: '' })
        await checkAdminAuth()
      }
      setLoginForm(initialLoginForm)
      navigate('/users')
    } catch (error) {
      alert(error.message || 'Login failed')
      setLoginState((prev) => ({ ...prev, submitting: false, error: error.message || 'Login failed' }))
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Admin logout error:', error)
    }
    setLoginState({
      checking: false,
      submitting: false,
      authenticated: false,
      admin: null,
      error: '',
    })
    navigate('/')
  }

  if (loginState.checking) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <p className="eyebrow">Admin Panel</p>
          <h1>Checking session...</h1>
        </div>
      </div>
    )
  }

  if (!loginState.authenticated) {
    return (
      <div className="admin-login-shell">
        <form className="admin-login-card" onSubmit={handleLoginSubmit}>
          <p className="eyebrow">Admin Panel</p>
          <h1>Sign in</h1>
          <p className="section-text">Use the admin email and password created on the backend.</p>

          <label>
            <span>Email</span>
            <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange} />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} />
          </label>

          {loginState.error ? (
            <div className="message message-error">{loginState.error}</div>
          ) : null}

          <button type="submit" className="primary-btn" disabled={loginState.submitting}>
            {loginState.submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <p className="section-text">{loginState.admin?.email || ''}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/users"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            User
          </NavLink>
          <NavLink
            to="/plans"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            Plans
          </NavLink>
          <NavLink
            to="/user-plans"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            User Plans
          </NavLink>
          <NavLink
            to="/whatsapp"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            WhatsApp
          </NavLink>
          <NavLink
            to="/insurance-companies"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            Insurance Companies
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            Settings
          </NavLink>
        </nav>

        <button type="button" className="secondary-btn sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="content-area">
        <Routes>
          <Route path="/users" element={<UsersPage apiFetch={wrappedApiFetch} />} />
          <Route path="/plans" element={<PlansPage apiFetch={wrappedApiFetch} />} />
          <Route path="/user-plans" element={<UserPlansPage apiFetch={wrappedApiFetch} />} />
          <Route path="/whatsapp" element={<WhatsAppPage apiFetch={wrappedApiFetch} />} />
          <Route path="/insurance-companies" element={<InsuranceCompaniesPage apiFetch={wrappedApiFetch} />} />
          <Route path="/settings" element={<SettingsPage apiFetch={wrappedApiFetch} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default AppSecure
