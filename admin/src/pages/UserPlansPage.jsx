import { useEffect, useState } from 'react'
import '../App.css'

function UserPlansPage({ apiFetch }) {
  const [userPlans, setUserPlans] = useState([])
  const [userPlansLoading, setUserPlansLoading] = useState(false)

  const fetchUserPlans = async () => {
    try {
      setUserPlansLoading(true)
      const result = await apiFetch('/api/user-plans')
      setUserPlans(result.data || [])
    } catch (error) {
      console.error('Error fetching user plans:', error)
    } finally {
      setUserPlansLoading(false)
    }
  }

  useEffect(() => { fetchUserPlans() }, [])

  return (
    <section className="panel panel-full">
      <div className="panel-header panel-header-row">
        <h2>User Plan Assignments</h2>
        <div className="toolbar">
          <button type="button" className="secondary-btn" onClick={fetchUserPlans}>Refresh</button>
        </div>
      </div>

      {userPlansLoading ? (
        <div className="empty-state">Loading user plans...</div>
      ) : userPlans.length === 0 ? (
        <div className="empty-state">No plan assignments found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>Plan</th>
                <th>Start</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>AI Used</th>
                <th>Manual Used</th>
              </tr>
            </thead>
            <tbody>
              {userPlans.map((up) => (
                <tr key={up._id}>
                  <td style={{ fontWeight: 600 }}>{up.userId?.name || 'N/A'}</td>
                  <td>{up.userId?.mobile || 'N/A'}</td>
                  <td>
                    <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                      {up.planId?.name || 'N/A'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{new Date(up.startDate).toLocaleDateString()}</td>
                  <td style={{ fontSize: '13px' }}>{up.expiryDate ? new Date(up.expiryDate).toLocaleDateString() : 'No Expiry'}</td>
                  <td>
                    <span className={`status-pill ${up.status === 'active' ? 'status-active' : up.status === 'expired' ? 'status-inactive' : 'status-pending'}`}>
                      {up.status}
                    </span>
                  </td>
                  <td>{up.usage?.aiDocumentsUsed ?? 0}</td>
                  <td>{up.usage?.manualDocumentsUsed ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default UserPlansPage
