import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Renewals = () => {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [expiryFilter, setExpiryFilter] = useState(60)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [financialYear, setFinancialYear] = useState('')
  const [availableFinancialYears, setAvailableFinancialYears] = useState([])
  const [confirmModal, setConfirmModal] = useState(null)

  useEffect(() => {
    fetchRenewals()
  }, [])

  useEffect(() => {
    fetchRenewals(financialYear)
  }, [financialYear])

  const fetchRenewals = async (fy = '') => {
    try {
      setLoading(true)
      const params = {}
      if (fy) params.financialYear = fy
      // Dedicated endpoint — only fetches records relevant for renewals
      const response = await axios.get(`${API_URL}/api/insurance/renewals`, {
        withCredentials: true,
        params,
      })
      if (response.data?.success) {
        setPolicies(response.data.data)
        if (response.data.financialYears) setAvailableFinancialYears(response.data.financialYears)
      }
    } catch (err) {
      console.error('Error fetching renewals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (id, status) => {
    const labels = { renewed: 'Renewed', lost: 'Lost', opportunity: 'Opportunity', pending: 'Reset to Pending' }
    setConfirmModal({ id, status, label: labels[status] })
  }

  const confirmAction = async () => {
    if (!confirmModal) return
    const { id, status } = confirmModal
    setConfirmModal(null)
    try {
      await axios.patch(
        `${API_URL}/api/insurance/${id}/renewal-status`,
        { status },
        { withCredentials: true }
      )
      setPolicies((prev) =>
        prev.map((p) => (p._id === id ? { ...p, renewalStatus: status } : p))
      )
    } catch (err) {
      console.error('Error updating renewal status:', err)
    }
  }

  const filteredPolicies = policies.filter((p) => {
    const s = p.renewalStatus || 'pending'
    if (statusFilter === 'renewed') return s === 'renewed'
    if (statusFilter === 'opportunity') return s === 'opportunity'
    if (statusFilter === 'lost') return s === 'lost'
    // Pending tab: show expired (within 60 days past) OR expiring within expiryFilter days
    if (s !== 'pending') return false
    const isExpired = p.daysLeft < 0
    const isExpiringSoon = p.daysLeft >= 0 && p.daysLeft <= expiryFilter
    return isExpired || isExpiringSoon
  })

  // Count badges for tabs
  const expiredPendingCount = policies.filter(
    (p) => (p.renewalStatus || 'pending') === 'pending' && p.daysLeft < 0
  ).length

  const pendingCount = policies.filter((p) => {
    const s = p.renewalStatus || 'pending'
    if (s !== 'pending') return false
    return (p.daysLeft < 0) || (p.daysLeft >= 0 && p.daysLeft <= expiryFilter)
  }).length

  const renewedCount = policies.filter((p) => p.renewalStatus === 'renewed').length
  const opportunityCount = policies.filter((p) => p.renewalStatus === 'opportunity').length
  const lostCount = policies.filter((p) => p.renewalStatus === 'lost').length

  const statusTabs = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'renewed', label: 'Renewed', count: renewedCount },
    { key: 'opportunity', label: 'Opportunity', count: opportunityCount },
    { key: 'lost', label: 'Lost', count: lostCount },
  ]

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-2 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>

            {/* Header Row */}
            <div className='mb-4 flex items-center justify-between flex-wrap gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600'>
                  <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                </div>
                <div>
                  <h2 className='text-lg font-black text-slate-900'>Renewals</h2>
                  {expiredPendingCount > 0 && statusFilter === 'pending' && (
                    <p className='text-[10px] font-bold text-rose-500 uppercase tracking-wide'>
                      {expiredPendingCount} expired · action needed
                    </p>
                  )}
                </div>
              </div>

              {/* Day-range filter — only for Pending tab */}
              {statusFilter === 'pending' && (
                <div className='flex items-center gap-1 rounded-xl bg-slate-100 p-1'>
                  {[15, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => setExpiryFilter(days)}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        expiryFilter === days
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {days}<span className='lowercase'>d</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Financial Year filter */}
              <div className='relative'>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className='appearance-none rounded-xl border-2 border-slate-200 bg-white py-1.5 pl-3 pr-7 text-[10px] font-bold text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer'
                >
                  <option value=''>All FY</option>
                  {availableFinancialYears.map((y) => (
                    <option key={y} value={String(y)}>FY {y}-{String(y + 1).slice(2)}</option>
                  ))}
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-2 flex items-center'>
                  <svg className='w-3 h-3 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className='mb-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden'>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex-none items-center justify-center gap-1 rounded-lg px-2 py-2 lg:px-4 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`inline-flex flex-shrink-0 items-center justify-center rounded-full px-1 py-0.5 text-[8px] lg:text-[9px] font-black leading-none ${
                      statusFilter === tab.key
                        ? tab.key === 'lost' ? 'bg-red-100 text-red-600' : tab.key === 'renewed' ? 'bg-emerald-100 text-emerald-600' : tab.key === 'opportunity' ? 'bg-sky-100 text-sky-600' : 'bg-amber-100 text-amber-600'
                        : 'bg-slate-300 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>



            {loading ? (
              <div className='text-center py-12'>
                <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Loading renewals...</p>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                <div className='flex justify-center mb-3'>
                  <svg className='h-10 w-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                </div>
                <p className='text-sm text-slate-500 font-bold'>No {statusFilter === 'renewed' ? 'renewed' : statusFilter === 'opportunity' ? 'opportunity' : statusFilter === 'lost' ? 'lost' : 'pending'} policies.</p>
                <p className='text-xs text-slate-400 mt-1'>All insurance policies are up to date.</p>
              </div>
            ) : (
              <>
                <div className='space-y-3 lg:hidden'>
                  {filteredPolicies.map((policy) => {
                    const status = policy.renewalStatus || ''
                    const isResolved = status === 'renewed' || status === 'lost'
                    const isExpired = policy.daysLeft < 0
                    return (
                      <div
                        key={policy._id}
                        onClick={() => navigate(`/rto-documents/Insurance/${policy._id}`)}
                        className={`group relative overflow-hidden rounded-xl border-2 p-3 shadow-sm transition-all cursor-pointer ${
                          status === 'renewed'
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : status === 'lost'
                            ? 'border-red-300 bg-red-50/30'
                            : status === 'opportunity'
                            ? 'border-sky-300 bg-sky-50/30'
                            : isExpired
                            ? 'border-rose-300 bg-rose-50/30'
                            : 'border-slate-200 bg-white hover:border-amber-400'
                        }`}
                      >
                        {/* Expired ribbon */}
                        {isExpired && !isResolved && (
                          <div className='absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg rounded-tr-xl'>
                            EXPIRED
                          </div>
                        )}
                        <div className='flex items-center gap-3'>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isExpired && !isResolved ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}>
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                            </svg>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='text-sm font-bold text-slate-900 truncate pr-12'>{policy.policyHolderName}</h3>
                            <p className='text-[10px] font-mono text-slate-500'>{policy.vehicleNumber}</p>
                            <p className='text-[9px] text-slate-400'>{policy.insuranceCompany}</p>
                            <p className='text-[10px] font-semibold text-indigo-600 mt-0.5'>{policy.product || '—'}</p>
                          </div>
                          <div className='text-right'>
                            <p className={`text-[11px] font-black ${
                              isExpired && !isResolved ? 'text-rose-600' : policy.daysLeft <= 5 ? 'text-rose-600' : 'text-amber-600'
                            }`}>
                              {policy.daysLeft < 0
                                ? `${Math.abs(policy.daysLeft)}d ago`
                                : policy.daysLeft === 0
                                ? 'Today'
                                : `${policy.daysLeft}d left`}
                            </p>
                            <p className='text-[10px] text-slate-400'>{policy.validTo}</p>
                          </div>
                        </div>
                        <div className='mt-2.5 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400'>
                          <div className='flex flex-col gap-0.5 min-w-0'>
                            <span><span className='font-semibold text-slate-500'>Policy:</span> {policy.policyNumber || '—'}</span>
                            <span><span className='font-semibold text-slate-500'>Class:</span> {policy.insuranceClass || '—'}</span>
                          </div>
                        </div>
                        {isResolved ? (
                          <div className='mt-2 flex justify-center border-t border-slate-100 pt-2'>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'pending') }}
                              className='text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline'
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <div className='mt-2 grid grid-cols-3 gap-1 border-t border-slate-100 pt-2'>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'renewed') }}
                              className='flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-1 py-2 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all'
                            >
                              <svg className='h-3.5 w-3.5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                              </svg>
                              Renewed
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'opportunity') }}
                              className='flex items-center justify-center gap-1 rounded-lg bg-sky-50 px-1 py-2 text-[10px] font-bold text-sky-600 hover:bg-sky-100 transition-all'
                            >
                              <svg className='h-3.5 w-3.5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              Opp
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'lost') }}
                              className='flex items-center justify-center gap-1 rounded-lg bg-red-50 px-1 py-2 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-all'
                            >
                              <svg className='h-3.5 w-3.5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                              </svg>
                              Lost
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className='hidden lg:block overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                  <table className='w-full text-left'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50/50'>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Holder</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Product / Class</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Company Name</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Policy No</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid To</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Days</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-50'>
                      {filteredPolicies.map((policy) => {
                        const status = policy.renewalStatus || ''
                        const isResolved = status === 'renewed' || status === 'lost'
                        const isExpired = policy.daysLeft < 0
                        return (
                          <tr
                            key={policy._id}
                            onClick={() => navigate(`/rto-documents/Insurance/${policy._id}`)}
                            className={`transition-colors hover:bg-slate-50/50 cursor-pointer ${
                              status === 'renewed'
                                ? 'bg-emerald-50/20'
                                : status === 'lost'
                                ? 'bg-red-50/20'
                                : status === 'opportunity'
                                ? 'bg-sky-50/20'
                                : isExpired
                                ? 'bg-rose-50/30'
                                : ''
                            }`}
                          >
                            <td className='px-4 py-2'>
                              <div className='text-sm font-bold text-slate-800'>{policy.policyHolderName || '—'}</div>
                              <div className='font-mono text-[10px] text-slate-500'>{policy.vehicleNumber}</div>
                            </td>
                            <td className='px-4 py-2 text-xs font-medium text-slate-500'>
                              <div className='text-sm font-bold text-indigo-700'>{policy.product || '—'}</div>
                              <div className='text-[10px] text-slate-400'>{policy.insuranceClass || '—'}</div>
                            </td>
                            <td className='px-4 py-2'>
                              <span className='text-xs font-medium text-slate-500'>{policy.insuranceCompany}</span>
                            </td>
                            <td className='px-4 py-2'>
                              <span className='text-xs font-semibold text-slate-600'>{policy.policyNumber || '—'}</span>
                            </td>
                            <td className='px-4 py-2 text-xs font-medium text-slate-500'>{policy.validTo}</td>
                            <td className='px-4 py-2'>
                              <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                status === 'renewed'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : status === 'lost'
                                  ? 'bg-red-50 text-red-600 border border-red-100'
                                  : status === 'opportunity'
                                  ? 'bg-sky-50 text-sky-600 border border-sky-100'
                                  : isExpired
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : policy.daysLeft <= 5
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {status === 'renewed'
                                  ? 'Renewed'
                                  : status === 'lost'
                                  ? 'Lost'
                                  : status === 'opportunity'
                                  ? 'Opportunity'
                                  : isExpired
                                  ? `${Math.abs(policy.daysLeft)}d ago`
                                  : policy.daysLeft === 0
                                  ? 'Today'
                                  : `${policy.daysLeft}d`}
                              </span>
                            </td>
                            <td className='px-4 py-2'>
                              {isResolved ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'pending') }}
                                  className='text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline'
                                >
                                  Reset
                                </button>
                              ) : status === 'opportunity' ? (
                                <div className='flex items-center gap-1'>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'renewed') }}
                                    className='flex items-center gap-0.5 rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                    </svg>
                                    Renewed
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'lost') }}
                                    className='flex items-center gap-0.5 rounded-lg bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                    Lost
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'pending') }}
                                    className='text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline'
                                  >
                                    Reset
                                  </button>
                                </div>
                              ) : (
                                <div className='flex items-center gap-1'>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'renewed') }}
                                    className='flex items-center gap-0.5 rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                    </svg>
                                    Renewed
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'opportunity') }}
                                    className='flex items-center gap-0.5 rounded-lg bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 hover:bg-sky-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    Opp
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(policy._id, 'lost') }}
                                    className='flex items-center gap-0.5 rounded-lg bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                    Lost
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {confirmModal && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm'>
            <div className='text-center mb-6'>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmModal.status === 'renewed' ? 'bg-emerald-100' : confirmModal.status === 'lost' ? 'bg-red-100' : confirmModal.status === 'opportunity' ? 'bg-sky-100' : 'bg-slate-100'
              }`}>
                {confirmModal.status === 'renewed' ? (
                  <svg className='w-7 h-7 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                ) : confirmModal.status === 'lost' ? (
                  <svg className='w-7 h-7 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                  </svg>
                ) : confirmModal.status === 'opportunity' ? (
                  <svg className='w-7 h-7 text-sky-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                ) : (
                  <svg className='w-7 h-7 text-slate-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                  </svg>
                )}
              </div>
              <h3 className='text-lg font-bold text-slate-800'>Confirm Action</h3>
              <p className='text-sm text-slate-500 mt-2'>
                Are you sure you want to mark this policy as <span className='font-bold text-slate-700'>{confirmModal.label}</span>?
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setConfirmModal(null)}
                className='flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer ${
                  confirmModal.status === 'renewed'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : confirmModal.status === 'lost'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmModal.status === 'opportunity'
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Renewals
