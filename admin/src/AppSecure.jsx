import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const initialForm = {
  _id: '',
  name: '',
  password: '',
  mobile: '',
  isActive: true,
}

const initialLoginForm = {
  email: '',
  password: '',
}

const initialWhatsAppForm = {
  displayName: '',
  phoneNumber: '',
}

function AppSecure() {
  const [activeSection, setActiveSection] = useState('users')
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })
  const [resettingPassword, setResettingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [adminNewPassword, setAdminNewPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [loginState, setLoginState] = useState({
    checking: true,
    submitting: false,
    authenticated: false,
    admin: null,
    error: '',
  })
  const [whatsAppState, setWhatsAppState] = useState({
    loading: false,
    actionLoading: false,
    sessions: [],
    activeSessionKey: '',
    selectedSessionKey: '',
    logs: [],
    logsLoading: false,
    result: '',
    error: '',
  })
  const [whatsAppForm, setWhatsAppForm] = useState(initialWhatsAppForm)

  const apiFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    })

    let result = {}
    try {
      result = await response.json()
    } catch (_error) {
      result = {}
    }

    if (response.status === 401) {
      setLoginState((prev) => ({
        ...prev,
        checking: false,
        authenticated: false,
        admin: null,
      }))
      throw new Error('Unauthorized')
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Request failed')
    }

    return result
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
        error: error.message === 'Unauthorized' ? '' : error.message || 'Failed to verify admin session',
      }))
    }
  }

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      const result = await apiFetch('/api/users')
      setUsers(result.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loginState.authenticated) return
    fetchUsers()
  }, [loginState.authenticated])

  const fetchWhatsAppStatus = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setWhatsAppState((prev) => ({ ...prev, loading: true, error: '' }))
      }

      const result = await apiFetch('/api/whatsapp/status')

      setWhatsAppState((prev) => ({
        ...prev,
        loading: false,
        sessions: result.data?.sessions || [],
        activeSessionKey: result.data?.activeSessionKey || '',
        selectedSessionKey:
          (result.data?.sessions || []).some((session) => session.sessionKey === prev.selectedSessionKey)
            ? prev.selectedSessionKey
            : (result.data?.activeSessionKey || result.data?.sessions?.[0]?.sessionKey || ''),
      }))
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error)
      setWhatsAppState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch WhatsApp status',
      }))
    }
  }

  const fetchWhatsAppLogs = async ({ silent = false } = {}) => {
    try {
      setWhatsAppState((prev) => ({
        ...prev,
        logsLoading: !silent,
      }))

      const result = await apiFetch('/api/whatsapp/logs?limit=100')

      setWhatsAppState((prev) => ({
        ...prev,
        logsLoading: false,
        logs: result.data || [],
      }))
    } catch (error) {
      console.error('Error fetching reminder logs:', error)
      setWhatsAppState((prev) => ({
        ...prev,
        logsLoading: false,
        error: error.message || 'Failed to fetch reminder logs',
      }))
    }
  }

  useEffect(() => {
    if (!loginState.authenticated || activeSection !== 'whatsapp') return undefined

    fetchWhatsAppStatus()
    fetchWhatsAppLogs()
    const intervalId = window.setInterval(() => {
      fetchWhatsAppStatus({ silent: true })
      fetchWhatsAppLogs({ silent: true })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [activeSection, loginState.authenticated])

  const runWhatsAppAction = async (sessionKey, endpoint, successText) => {
    try {
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: true,
        result: '',
        error: '',
      }))

      await apiFetch(`/api/whatsapp/sessions/${encodeURIComponent(sessionKey)}/${endpoint}`, {
        method: 'POST',
      })

      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        result: successText,
      }))

      await fetchWhatsAppStatus({ silent: true })
      await fetchWhatsAppLogs({ silent: true })
    } catch (error) {
      console.error(`Error during WhatsApp action ${endpoint}:`, error)
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        error: error.message || 'WhatsApp action failed',
      }))
    }
  }

  const createWhatsAppSession = async (e) => {
    e.preventDefault()

    const name = whatsAppForm.displayName.trim()
    const phone = whatsAppForm.phoneNumber.trim()

    if (!name && !phone) {
      setWhatsAppState((prev) => ({
        ...prev,
        error: 'Either mobile number or session name is required',
        result: '',
      }))
      return
    }

    try {
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: true,
        error: '',
        result: '',
      }))

      const result = await apiFetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: name || phone,
          phoneNumber: phone,
        }),
      })

      setWhatsAppForm(initialWhatsAppForm)
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        selectedSessionKey: result.data?.sessionKey || prev.selectedSessionKey,
        result: 'New WhatsApp session added',
      }))
      await fetchWhatsAppStatus({ silent: true })
    } catch (error) {
      console.error('Error creating WhatsApp session:', error)
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        error: error.message || 'Failed to create WhatsApp session',
      }))
    }
  }

  const setActiveWhatsAppSession = async (sessionKey) => {
    try {
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: true,
        error: '',
        result: '',
      }))

      await apiFetch(`/api/whatsapp/sessions/${encodeURIComponent(sessionKey)}/activate`, {
        method: 'POST',
      })

      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        result: 'Active sending session updated',
      }))
      await fetchWhatsAppStatus({ silent: true })
    } catch (error) {
      console.error('Error setting active WhatsApp session:', error)
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        error: error.message || 'Failed to set active session',
      }))
    }
  }

  const runReminderNow = async () => {
    try {
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: true,
        error: '',
        result: '',
      }))

      await apiFetch('/api/whatsapp/run-reminders', {
        method: 'POST',
      })

      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        result: 'Expiry reminders processed',
      }))
      await fetchWhatsAppLogs({ silent: true })
    } catch (error) {
      console.error('Error running reminders:', error)
      setWhatsAppState((prev) => ({
        ...prev,
        actionLoading: false,
        error: error.message || 'Failed to run reminders',
      }))
    }
  }

  const selectedWhatsAppSession = useMemo(
    () => whatsAppState.sessions.find((session) => session.sessionKey === whatsAppState.selectedSessionKey) || null,
    [whatsAppState.selectedSessionKey, whatsAppState.sessions]
  )

  const whatsAppStatusLabel = useMemo(() => {
    const status = selectedWhatsAppSession?.status || 'new'
    switch (status) {
      case 'authenticated':
        return 'Connected'
      case 'qr_ready':
        return 'Scan QR'
      case 'initializing':
        return 'Connecting'
      case 'auth_failure':
        return 'Auth Failed'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Not Started'
    }
  }, [selectedWhatsAppSession])

  const whatsAppStatusClass = useMemo(() => {
    const status = selectedWhatsAppSession?.status || 'new'
    if (status === 'authenticated') return 'status-active'
    if (status === 'qr_ready' || status === 'initializing') return 'status-pending'
    return 'status-inactive'
  }, [selectedWhatsAppSession])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (message.text) setMessage({ type: '', text: '' })
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (loginState.error) {
      setLoginState((prev) => ({ ...prev, error: '' }))
    }
  }

  const handleWhatsAppFormChange = (e) => {
    const { value } = e.target
    setWhatsAppForm({ displayName: value })
    if (whatsAppState.error || whatsAppState.result) {
      setWhatsAppState((prev) => ({ ...prev, error: '', result: '' }))
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    if (!loginForm.email || !loginForm.password) {
      setLoginState((prev) => ({
        ...prev,
        error: 'Email and password are required',
      }))
      return
    }

    try {
      setLoginState((prev) => ({
        ...prev,
        submitting: true,
        error: '',
      }))

      const result = await apiFetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      if (!result.data?.admin) {
        await checkAdminAuth()
      } else {
        setLoginState({
          checking: true,
          submitting: false,
          authenticated: false,
          admin: null,
          error: '',
        })
        await checkAdminAuth()
      }
      setLoginForm(initialLoginForm)
    } catch (error) {
      console.error('Admin login error:', error)
      alert(error.message || 'Login failed')
      setLoginState((prev) => ({
        ...prev,
        submitting: false,
        error: error.message || 'Login failed',
      }))
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Admin logout error:', error)
    }

    setActiveSection('users')
    setLoginState({
      checking: false,
      submitting: false,
      authenticated: false,
      admin: null,
      error: '',
    })
    setUsers([])
    setSearchTerm('')
    setShowAddUserModal(false)
    setIsEditMode(false)
    setFormData(initialForm)
    setWhatsAppForm(initialWhatsAppForm)
    setWhatsAppState({
      loading: false,
      actionLoading: false,
      sessions: [],
      activeSessionKey: '',
      selectedSessionKey: '',
      logs: [],
      logsLoading: false,
      result: '',
      error: '',
    })
    setCurrentPassword('')
    setAdminNewPassword('')
    setAdminConfirmPassword('')
    setSettingsMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.mobile || (!isEditMode && !formData.password)) {
      setMessage({ type: 'error', text: isEditMode ? 'Name and mobile are required' : 'Name, mobile, and password are required' })
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        isActive: formData.isActive,
      }

      if (formData.password) {
        payload.password = formData.password
      }

      await apiFetch(isEditMode ? `/api/users/${formData._id}` : '/api/users', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      setFormData(initialForm)
      setMessage({ type: 'success', text: isEditMode ? 'User updated successfully' : 'User created successfully' })
      setShowAddUserModal(false)
      setIsEditMode(false)
      fetchUsers()
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error)
      setMessage({ type: 'error', text: error.message || (isEditMode ? 'Failed to update user' : 'Failed to create user') })
    } finally {
      setSaving(false)
    }
  }

  const openResetPasswordModal = (user) => {
    setResetPasswordUser(user)
    setNewPassword('')
    setResetMessage({ type: '', text: '' })
    setShowResetPasswordModal(true)
  }

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false)
    setResetPasswordUser(null)
    setNewPassword('')
    setResetMessage({ type: '', text: '' })
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      setResetMessage({ type: 'error', text: 'New password is required' })
      return
    }

    try {
      setResettingPassword(true)
      await apiFetch(`/api/users/${resetPasswordUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: resetPasswordUser.name,
          mobile: resetPasswordUser.mobile,
          isActive: resetPasswordUser.isActive !== false,
          password: newPassword.trim(),
        }),
      })

      setResetMessage({ type: 'success', text: 'Password reset successfully!' })
      setTimeout(() => {
        closeResetPasswordModal()
      }, 1500)
    } catch (error) {
      console.error('Error resetting password:', error)
      setResetMessage({ type: 'error', text: error.message || 'Failed to reset password' })
    } finally {
      setResettingPassword(false)
    }
  }

  const handleAdminChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !adminNewPassword || !adminConfirmPassword) {
      setSettingsMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setSettingsMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    try {
      setChangingPassword(true)
      setSettingsMessage({ type: '', text: '' })
      await apiFetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword: adminNewPassword,
        }),
      })

      setSettingsMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setAdminNewPassword('')
      setAdminConfirmPassword('')
    } catch (error) {
      console.error('Error changing admin password:', error)
      setSettingsMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setChangingPassword(false)
    }
  }

  const openAddUserModal = () => {
    setFormData(initialForm)
    setMessage({ type: '', text: '' })
    setIsEditMode(false)
    setShowAddUserModal(true)
  }

  const openEditUserModal = (user) => {
    setFormData({
      _id: user._id,
      name: user.name || '',
      password: '',
      mobile: user.mobile || '',
      isActive: user.isActive !== false,
    })
    setMessage({ type: '', text: '' })
    setIsEditMode(true)
    setShowAddUserModal(true)
  }

  const closeUserModal = () => {
    setShowAddUserModal(false)
    setIsEditMode(false)
    setFormData(initialForm)
    setMessage({ type: '', text: '' })
  }

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [user.name, user.mobile].some((value) => String(value || '').toLowerCase().includes(query))
  })

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
          <button
            type="button"
            onClick={() => setActiveSection('users')}
            className={`sidebar-link ${activeSection === 'users' ? 'sidebar-link-active' : ''}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('whatsapp')}
            className={`sidebar-link ${activeSection === 'whatsapp' ? 'sidebar-link-active' : ''}`}
          >
            Add WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`sidebar-link ${activeSection === 'settings' ? 'sidebar-link-active' : ''}`}
          >
            Settings
          </button>
        </nav>

        <button type="button" className="secondary-btn sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="content-area">
        {activeSection === 'users' ? (
          <>
            <div className="panel-grid">
              <section className="panel panel-full">
                <div className="panel-header panel-header-row">
                  <h2>All Users</h2>
                  <div className="toolbar">
                    <div className="search-box">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search user"
                      />
                    </div>
                    <button type="button" className="secondary-btn" onClick={fetchUsers}>Refresh</button>
                    <button type="button" className="primary-btn small-btn" onClick={openAddUserModal}>
                      Add User
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="empty-state">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="empty-state">No users found.</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name || 'N/A'}</td>
                            <td>{user.mobile || 'N/A'}</td>
                            <td>
                              <span className={`status-pill ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" className="secondary-btn table-btn" onClick={() => openEditUserModal(user)}>
                                  Edit
                                </button>
                                <button type="button" className="secondary-btn table-btn" style={{ borderColor: '#fca5a5', color: '#b91c1c' }} onClick={() => openResetPasswordModal(user)}>
                                  Reset Password
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {showAddUserModal ? (
              <div className="modal-overlay">
                <div className="modal-card">
                  <div className="modal-header">
                    <div>
                      <p className="eyebrow">User Popup</p>
                      <h2>{isEditMode ? 'Edit User' : 'Add User'}</h2>
                    </div>
                    <button type="button" className="icon-btn" onClick={closeUserModal}>
                      x
                    </button>
                  </div>

                  <form className="user-form" onSubmit={handleSubmit}>
                    <label>
                      <span>Name</span>
                      <input name="name" value={formData.name} onChange={handleChange} />
                    </label>

                    <label>
                      <span>Password</span>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </label>

                    {isEditMode ? (
                      <label className="toggle-row">
                        <span>Active User</span>
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                      </label>
                    ) : null}

                    <label>
                      <span>Mobile</span>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} />
                    </label>

                    {message.text ? (
                      <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
                        {message.text}
                      </div>
                    ) : null}

                    <div className="modal-actions">
                      <button type="button" className="secondary-btn" onClick={closeUserModal}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn" disabled={saving}>
                        {saving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save User' : 'Create User')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {showResetPasswordModal ? (
              <div className="modal-overlay">
                <div className="modal-card">
                  <div className="modal-header">
                    <div>
                      <p className="eyebrow">User Security</p>
                      <h2>Reset Password</h2>
                      <p className="section-text" style={{ fontSize: '12px', marginTop: '4px' }}>Resetting password for: <strong>{resetPasswordUser?.name}</strong> ({resetPasswordUser?.mobile})</p>
                    </div>
                    <button type="button" className="icon-btn" onClick={closeResetPasswordModal}>
                      x
                    </button>
                  </div>

                  <form className="user-form" onSubmit={handleResetPasswordSubmit}>
                    <label>
                      <span>New Password</span>
                      <input type="password" name="newPassword" value={newPassword} onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (resetMessage.text) setResetMessage({ type: '', text: '' })
                      }} placeholder="Enter new password" />
                    </label>

                    {resetMessage.text ? (
                      <div className={`message ${resetMessage.type === 'error' ? 'message-error' : 'message-success'}`}>
                        {resetMessage.text}
                      </div>
                    ) : null}

                    <div className="modal-actions">
                      <button type="button" className="secondary-btn" onClick={closeResetPasswordModal}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn" disabled={resettingPassword}>
                        {resettingPassword ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </>
        ) : activeSection === 'whatsapp' ? (
          <>
            <section className="panel panel-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="panel-header panel-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h2>WhatsApp Integration</h2>
                  <p className="section-text">Connect your phone to enable automated document expiry alerts via WhatsApp.</p>
                </div>
                <div className="toolbar">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => fetchWhatsAppStatus()}
                    disabled={whatsAppState.loading || whatsAppState.actionLoading}
                  >
                    Refresh Status
                  </button>
                </div>
              </div>

              {whatsAppState.loading ? (
                <div className="empty-state">Loading WhatsApp status...</div>
              ) : whatsAppState.sessions.length === 0 ? (
                <div className="empty-state">Setting up connection... Please wait.</div>
              ) : (() => {
                const session = whatsAppState.sessions[0]
                const isConnected = session.status === 'authenticated'
                const isPending = session.status === 'qr_ready' || session.status === 'initializing'
                
                return (
                  <div className="whatsapp-simple-container" style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-pill ${isConnected ? 'status-active' : isPending ? 'status-pending' : 'status-inactive'}`} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 'bold' }}>
                        {isConnected ? '● Connected' : isPending ? '● Waiting for Scan' : '● Disconnected'}
                      </span>
                      {session.phoneNumber && session.phoneNumber !== 'Not connected' && (
                        <p className="section-text" style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
                          Connected Phone: +{session.phoneNumber}
                        </p>
                      )}
                    </div>

                    {isConnected ? (
                      <div className="whatsapp-connected-success" style={{ margin: '40px 0' }}>
                        <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>✓</div>
                        <h3>Your WhatsApp is successfully linked!</h3>
                        <p className="section-text" style={{ maxWidth: '400px', margin: '8px auto 0' }}>
                          BimaBox will now send automated reminders for document expiries to your customers.
                        </p>
                      </div>
                    ) : session.qrCodeDataUrl ? (
                      <div className="whatsapp-qr-container" style={{ margin: '30px 0' }}>
                        <div style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                          <img src={session.qrCodeDataUrl} alt="WhatsApp QR Code" style={{ width: '250px', height: '250px', display: 'block' }} />
                        </div>
                        <p className="section-text" style={{ maxWidth: '400px', margin: '0 auto' }}>
                          Open WhatsApp on your phone, go to <strong>Linked Devices</strong>, and scan the QR code above to connect.
                        </p>
                      </div>
                    ) : (
                      <div className="whatsapp-disconnected-state" style={{ margin: '40px 0' }}>
                        <p className="section-text" style={{ marginBottom: '20px' }}>
                          WhatsApp is currently disconnected. Click below to start the connection and generate a QR code.
                        </p>
                        <button
                          type="button"
                          className="primary-btn"
                          style={{ margin: '0 auto' }}
                          onClick={() => runWhatsAppAction(session.sessionKey, 'start', 'WhatsApp connection initiated')}
                          disabled={whatsAppState.actionLoading}
                        >
                          {whatsAppState.actionLoading ? 'Initializing...' : 'Get QR Code'}
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      {isConnected && (
                        <button
                          type="button"
                          className="secondary-btn"
                          style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                          onClick={() => runWhatsAppAction(session.sessionKey, 'reset', 'WhatsApp disconnected successfully')}
                          disabled={whatsAppState.actionLoading}
                        >
                          Disconnect WhatsApp
                        </button>
                      )}
                      {!isConnected && session.status !== 'disconnected' && (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => runWhatsAppAction(session.sessionKey, 'reset', 'Session reset. Requesting new QR...')}
                          disabled={whatsAppState.actionLoading}
                        >
                          Reset Connection
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}

              {whatsAppState.error ? (
                <div className="message message-error" style={{ marginTop: '20px' }}>{whatsAppState.error}</div>
              ) : null}
              {whatsAppState.result ? (
                <div className="message message-success" style={{ marginTop: '20px' }}>{whatsAppState.result}</div>
              ) : null}
            </section>
          </>
        ) : activeSection === 'settings' ? (
          <>
            <section className="panel panel-full" style={{ maxWidth: '600px' }}>
              <div className="panel-header">
                <h2>Account Settings</h2>
                <p className="section-text">Update your administrator password and manage your session.</p>
              </div>

              <form className="user-form" onSubmit={handleAdminChangePassword}>
                <label>
                  <span>Current Password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      if (settingsMessage.text) setSettingsMessage({ type: '', text: '' })
                    }}
                    placeholder="Enter current password"
                  />
                </label>

                <label>
                  <span>New Password</span>
                  <input
                    type="password"
                    value={adminNewPassword}
                    onChange={(e) => {
                      setAdminNewPassword(e.target.value)
                      if (settingsMessage.text) setSettingsMessage({ type: '', text: '' })
                    }}
                    placeholder="Enter new password"
                  />
                </label>

                <label>
                  <span>Confirm New Password</span>
                  <input
                    type="password"
                    value={adminConfirmPassword}
                    onChange={(e) => {
                      setAdminConfirmPassword(e.target.value)
                      if (settingsMessage.text) setSettingsMessage({ type: '', text: '' })
                    }}
                    placeholder="Confirm new password"
                  />
                </label>

                {settingsMessage.text ? (
                  <div className={`message ${settingsMessage.type === 'error' ? 'message-error' : 'message-success'}`}>
                    {settingsMessage.text}
                  </div>
                ) : null}

                <div className="modal-actions" style={{ marginTop: '8px' }}>
                  <button type="submit" className="primary-btn" disabled={changingPassword}>
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>

            <section className="panel panel-full" style={{ maxWidth: '600px', marginTop: '24px' }}>
              <div className="panel-header">
                <h2>Logout</h2>
                <p className="section-text">Sign out of the admin panel securely.</p>
              </div>
              <div style={{ padding: '16px 24px 24px' }}>
                <button type="button" className="primary-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default AppSecure
