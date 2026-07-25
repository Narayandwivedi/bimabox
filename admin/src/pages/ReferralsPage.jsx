import { useEffect, useState } from 'react'
import '../App.css'

function ReferralsPage({ apiFetch }) {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const result = await apiFetch('/api/referral/admin/all')
      setReferrals(result.data || [])
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReferrals() }, [])

  const filteredReferrals = referrals.filter((ref) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [
      ref.referrer?.name,
      ref.referrer?.mobile,
      ref.referredUser?.name,
      ref.referredUser?.mobile,
    ].some((value) => String(value || '').toLowerCase().includes(query))
  })

  return (
    <section className="panel panel-full">
      <div className="panel-header panel-header-row">
        <h2>Referrals</h2>
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or mobile"
            />
          </div>
          <button type="button" className="secondary-btn" onClick={fetchReferrals}>Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading referrals...</div>
      ) : filteredReferrals.length === 0 ? (
        <div className="empty-state">No referrals found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Referred By</th>
                <th>Referrer Mobile</th>
                <th>Referred User</th>
                <th>Referred User Mobile</th>
                <th>Status</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map((ref) => (
                <tr key={ref._id}>
                  <td style={{ fontSize: '13px' }}>{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{ref.referrer?.name || 'N/A'}</td>
                  <td>{ref.referrer?.mobile || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{ref.referredUser?.name || 'N/A'}</td>
                  <td>{ref.referredUser?.mobile || 'N/A'}</td>
                  <td>
                    <span className={`status-pill ${ref.status === 'completed' ? 'status-active' : 'status-pending'}`}>
                      {ref.status}
                    </span>
                  </td>
                  <td>₹{ref.rewardAmount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ReferralsPage
