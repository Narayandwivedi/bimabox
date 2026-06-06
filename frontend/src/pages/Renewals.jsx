import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { parseDate } from '../utils/dateFormatter'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Renewals = () => {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [expiryFilter, setExpiryFilter] = useState(60)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [confirmModal, setConfirmModal] = useState(null)

  const calculateDaysLeft = (validTo) => {
    if (!validTo || validTo === 'N/A' || validTo === 'None') return 9999
    const expiryDate = parseDate(validTo)
    if (!expiryDate) return 9999
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expiryDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  useEffect(() => {
    fetchInsurance()
  }, [])

  const fetchInsurance = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/insurance`, {
        withCredentials: true,
        params: { limit: 1000 },
      })
      if (response.data?.success) {
        const records = response.data.data.map((record) => {
          const daysLeft = calculateDaysLeft(record.validTo)
          return { ...record, daysLeft }
        })
        const upcoming = records.filter((r) => r.daysLeft > 0)
        upcoming.sort((a, b) => a.daysLeft - b.daysLeft)
        setPolicies(upcoming)
      }
    } catch (err) {
      console.error('Error fetching insurance:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (id, status) => {
    const labels = { renewed: 'Renewal Done', lost: 'Business Lost', pending: 'Reset to Pending' }
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
    if (statusFilter === 'lost') return s === 'lost'
    return s === 'pending'
  }).filter((p) => p.daysLeft <= expiryFilter)

  const statusTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'renewed', label: 'Renewal Done' },
    { key: 'lost', label: 'Business Lost' },
  ]

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-2 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600'>
                  <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                </div>
                <h2 className='text-lg font-black text-slate-900'>Renewals</h2>
              </div>
              <div className='flex items-center gap-1.5 rounded-xl bg-slate-100 p-1'>
                {[15, 30, 60].map((days) => (
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
            </div>

            <div className='mb-6 flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 w-fit'>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
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
                <p className='text-sm text-slate-500 font-bold'>No {statusFilter === 'renewed' ? 'renewed' : statusFilter === 'lost' ? 'lost' : 'pending'} policies.</p>
                <p className='text-xs text-slate-400 mt-1'>All insurance policies are up to date.</p>
              </div>
            ) : (
              <>
                <div className='space-y-3 lg:hidden'>
                    {filteredPolicies.map((policy) => {
                    const status = policy.renewalStatus || ''
                    const isResolved = status === 'renewed' || status === 'lost'
                    return (
                      <div
                        key={policy._id}
                        onClick={() => navigate(`/rto-documents/Insurance/${policy._id}`)}
                        className={`group relative overflow-hidden rounded-xl border-2 p-3 shadow-sm transition-all cursor-pointer ${
                          status === 'renewed'
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : status === 'lost'
                            ? 'border-red-300 bg-red-50/30'
                            : 'border-slate-200 bg-white hover:border-amber-400'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600'>
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                            </svg>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='text-sm font-bold text-slate-900 truncate'>{policy.insuranceCompany}</h3>
                            <p className='text-[10px] font-mono text-slate-500'>{policy.vehicleNumber}</p>
                            <p className='text-[9px] text-slate-400'>{policy.policyHolderName}</p>
                          </div>
                          <div className='text-right'>
                            <p className={`text-[11px] font-black ${policy.daysLeft <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                              {policy.daysLeft < 0 ? 'Expired' : policy.daysLeft === 0 ? 'Today' : `${policy.daysLeft}d left`}
                            </p>
                            <p className='text-[10px] text-slate-400'>{policy.validTo}</p>
                          </div>
                        </div>
                        <div className='mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400'>
                          <div className='flex items-center gap-4'>
                            <span><span className='font-semibold text-slate-500'>Policy:</span> {policy.policyNumber || '—'}</span>
                            <span><span className='font-semibold text-slate-500'>Class:</span> {policy.insuranceClass || '—'}</span>
                          </div>
                          {isResolved ? (
                            <button
                              onClick={() => handleStatusChange(policy._id, 'pending')}
                              className='text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline'
                            >
                              Reset
                            </button>
                          ) : (
                            <div className='flex items-center gap-2'>
                              <button
                                onClick={() => handleStatusChange(policy._id, 'renewed')}
                                className='flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all'
                              >
                                <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                </svg>
                                Done
                              </button>
                              <button
                                onClick={() => handleStatusChange(policy._id, 'lost')}
                                className='flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-all'
                              >
                                <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                                Lost
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className='hidden lg:block overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                  <table className='w-full text-left'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50/50'>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Company Name</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Vehicle</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Holder</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Policy No</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Class</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid To</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Days</th>
                        <th className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-50'>
                      {filteredPolicies.map((policy) => {
                        const status = policy.renewalStatus || ''
                        const isResolved = status === 'renewed' || status === 'lost'
                        return (
                          <tr key={policy._id} onClick={() => navigate(`/rto-documents/Insurance/${policy._id}`)} className={`transition-colors hover:bg-slate-50/50 cursor-pointer ${
                            status === 'renewed' ? 'bg-emerald-50/20' : status === 'lost' ? 'bg-red-50/20' : ''
                          }`}>
                            <td className='px-4 py-2'>
                              <div className='flex items-center gap-2'>
                                <span className='text-sm font-bold text-slate-800'>{policy.insuranceCompany}</span>
                              </div>
                            </td>
                            <td className='px-4 py-2'>
                              <span className='font-mono text-xs font-bold text-slate-600'>{policy.vehicleNumber}</span>
                            </td>
                            <td className='px-4 py-2 text-xs font-medium text-slate-500'>{policy.policyHolderName || '—'}</td>
                            <td className='px-4 py-2'>
                              <span className='text-xs font-semibold text-slate-600'>{policy.policyNumber || '—'}</span>
                            </td>
                            <td className='px-4 py-2 text-xs font-medium text-slate-500'>{policy.insuranceClass || '—'}</td>
                            <td className='px-4 py-2 text-xs font-medium text-slate-500'>{policy.validTo}</td>
                            <td className='px-4 py-2'>
                              <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                status === 'renewed'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : status === 'lost'
                                  ? 'bg-red-50 text-red-600 border border-red-100'
                                  : policy.daysLeft <= 5
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {status === 'renewed' ? 'Renewed' : status === 'lost' ? 'Lost' : policy.daysLeft < 0 ? 'Expired' : policy.daysLeft === 0 ? 'Today' : `${policy.daysLeft}d`}
                              </span>
                            </td>
                            <td className='px-4 py-2'>
                              {isResolved ? (
                                <button
                                  onClick={() => handleStatusChange(policy._id, 'pending')}
                                  className='text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline'
                                >
                                  Reset
                                </button>
                              ) : (
                                <div className='flex items-center gap-1'>
                                  <button
                                    onClick={() => handleStatusChange(policy._id, 'renewed')}
                                    className='flex items-center gap-0.5 rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all'
                                  >
                                    <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                    </svg>
                                    Done
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(policy._id, 'lost')}
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
                confirmModal.status === 'renewed' ? 'bg-emerald-100' : confirmModal.status === 'lost' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {confirmModal.status === 'renewed' ? (
                  <svg className='w-7 h-7 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                ) : confirmModal.status === 'lost' ? (
                  <svg className='w-7 h-7 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
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
