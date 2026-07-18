import { useEffect, useState } from 'react'
import '../App.css'

function UsersPage({ apiFetch }) {
  const initialForm = {
    _id: '', name: '', password: '', mobile: '', isActive: true,
    selectedPlanId: '', planStartDate: '',
  }

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
  const [accessingUserId, setAccessingUserId] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyPlans, setHistoryPlans] = useState([])
  const [historyUserName, setHistoryUserName] = useState('')
  const [historyLoading, setHistoryLoading] = useState(false)
  const [plans, setPlans] = useState([])

  const fetchPlans = async () => {
    try {
      const result = await apiFetch('/api/subscription-plans')
      setPlans(result.data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

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
    fetchUsers()
    fetchPlans()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (message.text) setMessage({ type: '', text: '' })
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

      const result = await apiFetch(isEditMode ? `/api/users/${formData._id}` : '/api/users', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const savedUserId = isEditMode ? formData._id : result.data?._id

      if (savedUserId && formData.selectedPlanId) {
        try {
          await apiFetch('/api/user-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: savedUserId,
              planId: formData.selectedPlanId,
              startDate: formData.planStartDate || undefined,
            }),
          })
        } catch (planError) {
          console.error('Error assigning plan:', planError)
        }
      }

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

  const handleAccessUser = async (user) => {
    try {
      setAccessingUserId(user._id)
      const result = await apiFetch(`/api/auth/admin/access-user/${user._id}`, {
        method: 'POST',
      })
      const redirectUrl = result.data?.redirectUrl || 'https://bimabox.in'
      window.open(redirectUrl, '_blank')
    } catch (error) {
      console.error('Error accessing user:', error)
      alert(error.message || 'Failed to access user account')
    } finally {
      setAccessingUserId(null)
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

  const openPlanHistory = async (user) => {
    setHistoryUserName(user.name || '')
    setHistoryPlans([])
    setShowHistoryModal(true)
    setHistoryLoading(true)
    try {
      const result = await apiFetch(`/api/user-plans/history/${user._id}`)
      setHistoryPlans(result.data || [])
    } catch (error) {
      console.error('Error fetching plan history:', error)
    } finally {
      setHistoryLoading(false)
    }
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

  return (
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
                    <th>Plan</th>
                    <th>Expiry</th>
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
                        <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                          {user.planName || 'Free'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {user.planExpiry ? new Date(user.planExpiry).toLocaleDateString() : 'No Expiry'}
                      </td>
                      <td>
                        <span className={`status-pill ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="secondary-btn table-btn"
                            style={{ borderColor: '#6ee7b7', color: '#065f46' }}
                            onClick={() => handleAccessUser(user)}
                            disabled={accessingUserId === user._id}
                          >
                            {accessingUserId === user._id ? 'Redirecting...' : 'Access'}
                          </button>
                          <button type="button" className="secondary-btn table-btn" onClick={() => openEditUserModal(user)}>
                            Edit
                          </button>
                          <button type="button" className="secondary-btn table-btn" onClick={() => openPlanHistory(user)}>
                            History
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

              {isEditMode ? (
                <>
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                  <p className="eyebrow" style={{ margin: '0', color: '#64748b' }}>Plan Assignment</p>
                  <label>
                    <span>Plan</span>
                    <select name="selectedPlanId" value={formData.selectedPlanId} onChange={handleChange} style={{ height: '42px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      <option value="">No plan change</option>
                      {plans.filter((p) => p.isActive).map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - ₹{p.price} / {p.durationDays > 0 ? `${p.durationDays} days` : 'No Expiry'}
                        </option>
                      ))}
                    </select>
                  </label>
                  {formData.selectedPlanId ? (
                    <label>
                      <span>Start Date (leave empty for today)</span>
                      <input type="date" name="planStartDate" value={formData.planStartDate} onChange={handleChange} />
                    </label>
                  ) : null}
                </>
              ) : null}

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

      {showHistoryModal ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Plan History</p>
                <h2>{historyUserName}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowHistoryModal(false)}>x</button>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              {historyLoading ? (
                <div className="empty-state">Loading history...</div>
              ) : historyPlans.length === 0 ? (
                <div className="empty-state">No plan history found.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {historyPlans.map((hp) => (
                    <div key={hp._id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '16px' }}>{hp.planId?.name || 'N/A'}</strong>
                        <span className={`status-pill ${hp.status === 'active' ? 'status-active' : hp.status === 'expired' ? 'status-inactive' : 'status-pending'}`}>
                          {hp.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                        <span>Start: {new Date(hp.startDate).toLocaleDateString()}</span>
                        <span>Expiry: {hp.expiryDate ? new Date(hp.expiryDate).toLocaleDateString() : 'No Expiry'}</span>
                        {hp.usage ? (
                          <>
                            <span>AI Used: {hp.usage.aiDocumentsUsed ?? 0}</span>
                            <span>Manual Used: {hp.usage.manualDocumentsUsed ?? 0}</span>
                          </>
                        ) : null}
                      </div>
                      {hp.notes ? (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>{hp.notes}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default UsersPage
