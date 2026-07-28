import { useEffect, useState, useCallback } from 'react'
import '../App.css'

const PAGE_SIZE = 25

function PolicySearchPage({ apiFetch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('')
  const [financialYear, setFinancialYear] = useState('')

  const [filters, setFilters] = useState({ users: [], companies: [], productTypes: [] })
  const [financialYears, setFinancialYears] = useState([])
  const [policies, setPolicies] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchFilters = useCallback(async () => {
    try {
      const result = await apiFetch('/api/admin-policies/filters')
      setFilters(result.data || { users: [], companies: [], productTypes: [] })
    } catch (err) {
      console.error('Error fetching filters:', err)
    }
  }, [apiFetch])

  const fetchPolicies = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ page: String(pageNum), limit: String(PAGE_SIZE) })
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (userId) params.set('userId', userId)
      if (productTypeId) params.set('productTypeId', productTypeId)
      if (insuranceCompanyId) params.set('insuranceCompanyId', insuranceCompanyId)
      if (financialYear) params.set('financialYear', financialYear)

      const result = await apiFetch(`/api/admin-policies?${params.toString()}`)
      setPolicies(result.data || [])
      setPagination(result.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 })
      setFinancialYears(result.financialYears || [])
      setPage(pageNum)
    } catch (err) {
      setError(err.message || 'Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }, [apiFetch, searchTerm, userId, productTypeId, insuranceCompanyId, financialYear])

  useEffect(() => { fetchFilters() }, [fetchFilters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => fetchPolicies(1), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchTerm, userId, productTypeId, insuranceCompanyId, financialYear, fetchPolicies])

  const handleClearFilters = () => {
    setSearchTerm('')
    setUserId('')
    setProductTypeId('')
    setInsuranceCompanyId('')
    setFinancialYear('')
  }

  const activeFilterCount = [userId, productTypeId, insuranceCompanyId, financialYear].filter(Boolean).length

  const formatDate = (dateStr) => dateStr || '-'

  return (
    <section className="panel panel-full">
      <div className="panel-header panel-header-row">
        <div>
          <h2>Policy Search</h2>
          <p className="section-text">Search and filter every user's insurance policies across the platform.</p>
        </div>
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle no, policy no, holder name..."
              style={{ minWidth: '320px' }}
            />
          </div>
          <button type="button" className="secondary-btn" onClick={() => fetchPolicies(page)}>Refresh</button>
        </div>
      </div>

      <div style={{ padding: '0 24px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ height: '40px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}
        >
          <option value="">All Users</option>
          {filters.users.map((u) => (
            <option key={u._id} value={u._id}>{u.name || 'N/A'}{u.mobile ? ` (${u.mobile})` : ''}</option>
          ))}
        </select>

        <select
          value={insuranceCompanyId}
          onChange={(e) => setInsuranceCompanyId(e.target.value)}
          style={{ height: '40px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}
        >
          <option value="">All Insurance Companies</option>
          {filters.companies.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={productTypeId}
          onChange={(e) => setProductTypeId(e.target.value)}
          style={{ height: '40px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}
        >
          <option value="">All Product Types</option>
          {filters.productTypes.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          style={{ height: '40px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}
        >
          <option value="">All Financial Years</option>
          {financialYears.map((y) => (
            <option key={y} value={String(y)}>{y}-{String(y + 1).slice(2)}</option>
          ))}
        </select>
      </div>

      {activeFilterCount > 0 ? (
        <div style={{ padding: '0 24px 16px' }}>
          <button type="button" className="secondary-btn" onClick={handleClearFilters} style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
            Clear Filters ({activeFilterCount})
          </button>
        </div>
      ) : null}

      {error ? (
        <div style={{ padding: '0 24px 16px' }}>
          <div className="message message-error">{error}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="empty-state">Loading policies...</div>
      ) : policies.length === 0 ? (
        <div className="empty-state">No policies match your filters.</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Vehicle No</th>
                  <th>Policy No</th>
                  <th>Company</th>
                  <th>Product</th>
                  <th>Policy Type</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.userId?.name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>{p.userId?.mobile || ''}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.vehicleNumber || '-'}</td>
                    <td>{p.policyNumber || '-'}</td>
                    <td>{p.insuranceCompany || '-'}</td>
                    <td>{p.product || '-'}</td>
                    <td>{p.insuranceClass || '-'}</td>
                    <td>{formatDate(p.validFrom)}</td>
                    <td>{formatDate(p.validTo)}</td>
                    <td>₹{(p.premium || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="toolbar" style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
            <span className="section-text" style={{ margin: 0 }}>
              Showing {(pagination.currentPage - 1) * PAGE_SIZE + 1}-{Math.min(pagination.currentPage * PAGE_SIZE, pagination.totalRecords)} of {pagination.totalRecords}
            </span>
            <div className="toolbar">
              <button type="button" className="secondary-btn" disabled={page <= 1} onClick={() => fetchPolicies(page - 1)}>Previous</button>
              <span className="section-text" style={{ margin: 0 }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button type="button" className="secondary-btn" disabled={page >= pagination.totalPages} onClick={() => fetchPolicies(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default PolicySearchPage
