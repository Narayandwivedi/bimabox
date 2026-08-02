import { useEffect, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import '../App.css'

const PAGE_SIZE = 500
const ALL_LIMIT = 100000

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

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const hasActiveFilter = Boolean(searchTerm.trim() || userId || productTypeId || insuranceCompanyId || financialYear)
      const limit = hasActiveFilter ? ALL_LIMIT : PAGE_SIZE
      const params = new URLSearchParams({ page: '1', limit: String(limit) })
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (userId) params.set('userId', userId)
      if (productTypeId) params.set('productTypeId', productTypeId)
      if (insuranceCompanyId) params.set('insuranceCompanyId', insuranceCompanyId)
      if (financialYear) params.set('financialYear', financialYear)

      const result = await apiFetch(`/api/admin-policies?${params.toString()}`)
      setPolicies(result.data || [])
      setPagination(result.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 })
      setFinancialYears(result.financialYears || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }, [apiFetch, searchTerm, userId, productTypeId, insuranceCompanyId, financialYear])

  useEffect(() => { fetchFilters() }, [fetchFilters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => fetchPolicies(), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchTerm, userId, productTypeId, insuranceCompanyId, financialYear, fetchPolicies])

  const handleClearFilters = () => {
    setSearchTerm('')
    setUserId('')
    setProductTypeId('')
    setInsuranceCompanyId('')
    setFinancialYear('')
  }

  const handleExport = async () => {
    try {
      setError('')
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (userId) params.set('userId', userId)
      if (productTypeId) params.set('productTypeId', productTypeId)
      if (insuranceCompanyId) params.set('insuranceCompanyId', insuranceCompanyId)
      if (financialYear) params.set('financialYear', financialYear)

      const result = await apiFetch(`/api/admin-policies/export?${params.toString()}`)
      const records = result.data || []

      const exportData = records.map((p) => ({
        'User Name': p.userId?.name || 'N/A',
        'Mobile': p.userId?.mobile || '',
        'Policy Holder': p.policyHolderName || '',
        'Vehicle No': p.vehicleNumber || '',
        'Policy No': p.policyNumber || '',
        'Insurance Company': p.insuranceCompany || '',
        'Product': p.product || '',
        'Policy Type': p.insuranceClass || '',
        'Valid From': p.validFrom || '',
        'Valid To': p.validTo || '',
        'Premium': p.premium || '',
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Policies')
      XLSX.writeFile(wb, `policies_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      setError(err.message || 'Failed to export policies')
    }
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
          <button type="button" className="secondary-btn" onClick={() => fetchPolicies()}>Refresh</button>
          <button
            type="button"
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 16px',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'transform 0.18s ease, opacity 0.18s ease, background 0.18s ease',
              boxShadow: '0 12px 24px -14px rgba(34, 197, 94, 0.7)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export Excel
          </button>
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
                  <th>Company</th>
                  <th>Validity</th>
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
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.policyHolderName || p.vehicleNumber || '-'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>{p.policyHolderName ? (p.vehicleNumber || '-') : ''}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.insuranceCompany || '-'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>{p.policyNumber || '-'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{p.product || '-'}</div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>{p.insuranceClass || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>{formatDate(p.validFrom)}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626' }}>{formatDate(p.validTo)}</div>
                    </td>
                    <td>₹{(p.premium || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="toolbar" style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
            <span className="section-text" style={{ margin: 0 }}>
              Showing {policies.length} of {pagination.totalRecords} records
            </span>
          </div>
        </>
      )}
    </section>
  )
}

export default PolicySearchPage
