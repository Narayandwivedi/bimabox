import { useState } from 'react'
import '../App.css'

function SettingsPage({ apiFetch, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [adminNewPassword, setAdminNewPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' })
  const [changingPassword, setChangingPassword] = useState(false)

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword: adminNewPassword }),
      })
      setSettingsMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setAdminNewPassword('')
      setAdminConfirmPassword('')
    } catch (error) {
      setSettingsMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <>
      <section className="panel panel-full" style={{ maxWidth: '600px' }}>
        <div className="panel-header">
          <h2>Account Settings</h2>
          <p className="section-text">Update your administrator password and manage your session.</p>
        </div>

        <form className="user-form" onSubmit={handleAdminChangePassword}>
          <label>
            <span>Current Password</span>
            <input type="password" value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); if (settingsMessage.text) setSettingsMessage({ type: '', text: '' }) }}
              placeholder="Enter current password" />
          </label>

          <label>
            <span>New Password</span>
            <input type="password" value={adminNewPassword}
              onChange={(e) => { setAdminNewPassword(e.target.value); if (settingsMessage.text) setSettingsMessage({ type: '', text: '' }) }}
              placeholder="Enter new password" />
          </label>

          <label>
            <span>Confirm New Password</span>
            <input type="password" value={adminConfirmPassword}
              onChange={(e) => { setAdminConfirmPassword(e.target.value); if (settingsMessage.text) setSettingsMessage({ type: '', text: '' }) }}
              placeholder="Confirm new password" />
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
          <button type="button" className="primary-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </section>
    </>
  )
}

export default SettingsPage
