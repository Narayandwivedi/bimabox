import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AddVehicleModal from './VehicleRegistration/AddVehicleModal'
import AddInsuranceModal from './Insurance/AddInsuranceModal'
import { parseDate } from '../utils/dateFormatter'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Home = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showAddInsuranceModal, setShowAddInsuranceModal] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [expiryFilter, setExpiryFilter] = useState(30)
  const [initialExtractionFile, setInitialExtractionFile] = useState(null)
  const [realExpiringDocs, setRealExpiringDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [recentDocs, setRecentDocs] = useState([])
  const fileInputRef = useRef(null)
  
  useEffect(() => {
    fetchVehicles()
    fetchExpiringDocs()
    fetchRecentDocs()
  }, [])

  const calculateDaysLeft = (validTo) => {
    if (!validTo || validTo === 'N/A' || validTo === 'None') return 9999
    const expiryDate = parseDate(validTo)
    if (!expiryDate) return 9999
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expiryDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const fetchExpiringDocs = async () => {
    try {
      setLoadingDocs(true)
      const endpoints = [
        { type: 'Tax', url: `${API_URL}/api/tax`, fromField: 'taxFrom', toField: 'taxTo', color: 'emerald' },
        { type: 'PUC', url: `${API_URL}/api/puc`, fromField: 'validFrom', toField: 'validTo', color: 'amber' },
        { type: 'GPS', url: `${API_URL}/api/gps`, fromField: 'validFrom', toField: 'validTo', color: 'indigo' },
        { type: 'Fitness', url: `${API_URL}/api/fitness`, fromField: 'validFrom', toField: 'validTo', color: 'rose' },
        { type: 'Insurance', url: `${API_URL}/api/insurance`, fromField: 'validFrom', toField: 'validTo', color: 'blue' },
        { type: 'Permit', url: `${API_URL}/api/permit`, fromField: 'validFrom', toField: 'validTo', color: 'teal' },
      ]

      const requests = endpoints.map(ep => axios.get(ep.url, { withCredentials: true, params: { limit: 1000 } }))
      const responses = await Promise.allSettled(requests)
      
      let allDocs = []
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.success) {
          const ep = endpoints[index]
          const records = response.value.data.data.map(record => {
            const validTo = record[ep.toField] || 'N/A'
            const daysLeft = calculateDaysLeft(validTo)
            return {
              id: record._id,
              type: ep.type,
              vehicleNumber: record.vehicleNumber || 'N/A',
              validFrom: record[ep.fromField] || 'N/A',
              validTo: validTo,
              daysLeft: daysLeft,
              color: ep.color,
              rawRecord: record
            }
          })
          allDocs = [...allDocs, ...records]
        }
      })

      allDocs.sort((a, b) => a.daysLeft - b.daysLeft)
      setRealExpiringDocs(allDocs)
    } catch (error) {
      console.error('Error fetching expiring documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  const fetchRecentDocs = async () => {
    try {
      const endpoints = [
        { type: 'Tax', url: `${API_URL}/api/tax`, fromField: 'taxFrom', toField: 'taxTo', color: 'emerald' },
        { type: 'PUC', url: `${API_URL}/api/puc`, fromField: 'validFrom', toField: 'validTo', color: 'amber' },
        { type: 'GPS', url: `${API_URL}/api/gps`, fromField: 'validFrom', toField: 'validTo', color: 'indigo' },
        { type: 'Fitness', url: `${API_URL}/api/fitness`, fromField: 'validFrom', toField: 'validTo', color: 'rose' },
        { type: 'Insurance', url: `${API_URL}/api/insurance`, fromField: 'validFrom', toField: 'validTo', color: 'blue' },
        { type: 'Permit', url: `${API_URL}/api/permit`, fromField: 'validFrom', toField: 'validTo', color: 'teal' },
      ]
      const requests = endpoints.map(ep => axios.get(ep.url, { withCredentials: true, params: { limit: 5 } }))
      const responses = await Promise.allSettled(requests)
      let allDocs = []
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.success) {
          const ep = endpoints[index]
          const records = response.value.data.data.map(record => ({
            id: record._id,
            type: ep.type,
            vehicleNumber: record.vehicleNumber || 'N/A',
            validFrom: record[ep.fromField] || 'N/A',
            validTo: record[ep.toField] || 'N/A',
            createdAt: record.createdAt,
            color: ep.color,
          }))
          allDocs = [...allDocs, ...records]
        }
      })
      allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setRecentDocs(allDocs.slice(0, 5))
    } catch (error) {
      console.error('Error fetching recent documents:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/api/vehicle`, {
        params: { page: 1, limit: 1000 },
        withCredentials: true,
      })
      if (response.data?.success) {
        setVehicles(response.data.data || [])
      } else {
        setVehicles([])
        setError('Failed to load vehicles.')
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setVehicles([])
      setError('Failed to fetch registered vehicles.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-4 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-7xl mx-auto'>
            {/* Header and Search removed as requested */}

            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <div className='mb-6 grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  onClick={() => navigate('/rto-documents')}
                  className='flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-4 transition-all hover:border-blue-300 hover:bg-blue-100/50 hover:shadow-xl group'
                >
                  <div className='flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform'>
                    <svg className='h-5 w-5 md:h-6 md:w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                  <span className='text-[10px] md:text-sm font-bold text-blue-900'>RTO Documents</span>
                </button>

                <button
                  type='button'
                  onClick={() => setShowUploadOptions(true)}
                  className='flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-slate-100/50 hover:shadow-xl group'
                >
                  <div className='flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform'>
                    <svg className='h-5 w-5 md:h-6 md:w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                    </svg>
                  </div>
                  <span className='text-[10px] md:text-sm font-bold text-slate-900'>Upload Insurance</span>
                </button>
              </div>

              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-lg font-black text-slate-900'>Expiring Soon</h2>
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

              {(() => {
                const filteredDocs = realExpiringDocs.filter(doc => 
                  (doc.vehicleNumber.toUpperCase().includes(searchQuery.toUpperCase()) || 
                   doc.type.toUpperCase().includes(searchQuery.toUpperCase())) && 
                  doc.daysLeft <= expiryFilter
                )

                return (
                  <>
                    {/* Responsive View (Mobile Cards) */}
                    <div className='lg:hidden space-y-3'>
                      {loadingDocs ? (
                        <div className='text-center py-8'>
                          <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                          <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Scanning Documents...</p>
                        </div>
                      ) : filteredDocs.length === 0 ? (
                        <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                          <p className='text-sm text-slate-500 font-bold'>No documents expiring soon.</p>
                        </div>
                      ) : (
                        filteredDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className='group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-3 shadow-sm hover:border-blue-400 transition-all'
                          >
                            <div className='flex items-center gap-3'>
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${doc.color}-50 text-${doc.color}-600`}>
                                {doc.type === 'Insurance' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>}
                                {doc.type === 'Tax' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>}
                                {doc.type === 'PUC' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>}
                                {doc.type === 'Fitness' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' /></svg>}
                                {doc.type === 'GPS' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>}
                                {doc.type === 'Permit' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>}
                              </div>
                              <div className='min-w-0 flex-1'>
                                <h3 className='text-sm font-bold text-slate-900 truncate'>{doc.type}</h3>
                                <p className='text-[10px] font-mono text-slate-500'>{doc.vehicleNumber}</p>
                              </div>
                              <div className='text-right'>
                                <p className={`text-[11px] font-black ${doc.daysLeft <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                                  {doc.daysLeft < 0 ? 'Expired' : doc.daysLeft === 0 ? 'Today' : `${doc.daysLeft}d left`}
                                </p>
                                <p className='text-[10px] text-slate-400'>{doc.validTo}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop View (Cards - 4 in a row) */}
                    <div className='hidden lg:block'>
                      {loadingDocs ? (
                        <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                          <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                          <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Scanning Documents...</p>
                        </div>
                      ) : filteredDocs.length === 0 ? (
                        <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                          <p className='text-sm text-slate-500 font-bold'>No documents expiring soon.</p>
                        </div>
                      ) : (
                        <div className='grid grid-cols-4 gap-4'>
                          {filteredDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className='group relative overflow-hidden rounded-2xl border border-slate-150 bg-slate-50/30 p-4 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:border-blue-300 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.15)]'
                            >
                              {/* Color bar at top for premium feel */}
                              <div className={`absolute top-0 left-0 right-0 h-1 bg-${doc.color}-500`} />
                              
                              <div className='flex items-start justify-between mb-3 mt-1'>
                                <div className='flex items-center gap-2.5'>
                                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${doc.color}-50 text-${doc.color}-600 shadow-sm`}>
                                    {doc.type === 'Insurance' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>}
                                    {doc.type === 'Tax' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>}
                                    {doc.type === 'PUC' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>}
                                    {doc.type === 'Fitness' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' /></svg>}
                                    {doc.type === 'GPS' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>}
                                    {doc.type === 'Permit' && <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>}
                                  </div>
                                  <div>
                                    <h3 className='text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors'>{doc.type}</h3>
                                    <p className='text-[10px] font-mono font-bold text-slate-500 uppercase'>{doc.vehicleNumber}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${doc.daysLeft <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                  {doc.daysLeft < 0 ? 'Expired' : doc.daysLeft === 0 ? 'Today' : `${doc.daysLeft}d left`}
                                </span>
                              </div>

                              <div className='mt-4 pt-3 border-t border-slate-100/80 flex flex-col gap-1 text-[11px] text-slate-500'>
                                <div className='flex justify-between'>
                                  <span className='font-medium text-slate-400'>Valid From:</span>
                                  <span className='font-semibold text-slate-700'>{doc.validFrom}</span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='font-medium text-slate-400'>Valid To:</span>
                                  <span className='font-semibold text-slate-700'>{doc.validTo}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Recently Added */}
            <div className='mt-6 rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <h2 className='mb-6 text-lg font-black text-slate-900'>Recently Added</h2>
              {recentDocs.length === 0 ? (
                <div className='rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center'>
                  <p className='text-sm font-bold text-slate-500'>No recently added documents.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className='space-y-3 lg:hidden'>
                    {recentDocs.map((doc) => {
                      const dotColor = ({ emerald: '#10B981', amber: '#F59E0B', indigo: '#6366F1', rose: '#F43F5E', blue: '#3B82F6', teal: '#14B8A6' })[doc.color] || '#3B82F6'
                      return (
                        <div key={doc.id} className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)] transition-all hover:border-blue-300 hover:shadow-[0_8px_24px_-8px_rgba(59,130,246,0.18)]'>
                          <div className='flex items-center gap-3'>
                            <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: dotColor }} />
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-bold text-slate-800'>{doc.type}</p>
                              <p className='font-mono text-[11px] text-slate-500'>{doc.vehicleNumber}</p>
                            </div>
                            <p className='whitespace-nowrap text-[11px] font-semibold text-blue-600'>{timeAgo(doc.createdAt)}</p>
                          </div>
                          <div className='mt-2.5 flex items-center gap-4 border-t border-slate-100 pt-2.5'>
                            <div className='text-[10px] text-slate-400'>
                              <span className='font-semibold text-slate-500'>From:</span> {doc.validFrom}
                            </div>
                            <div className='text-[10px] text-slate-400'>
                              <span className='font-semibold text-slate-500'>To:</span> {doc.validTo}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className='hidden lg:block'>
                    <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                      <table className='w-full text-left'>
                        <thead>
                          <tr className='border-b border-slate-100 bg-slate-50/50'>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Document</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Vehicle</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid From</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid To</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right'>Added</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-50'>
                          {recentDocs.map((doc) => (
                            <tr key={doc.id} className='transition-colors hover:bg-slate-50/50 group'>
                              <td className='px-6 py-3'>
                                <div className='flex items-center gap-3'>
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${doc.color}-50 text-${doc.color}-600`}>
                                    {doc.type === 'Insurance' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>}
                                    {doc.type === 'Tax' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>}
                                    {doc.type === 'PUC' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>}
                                    {doc.type === 'Fitness' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' /></svg>}
                                    {doc.type === 'GPS' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>}
                                    {doc.type === 'Permit' && <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>}
                                  </div>
                                  <span className='text-sm font-bold text-slate-700'>{doc.type}</span>
                                </div>
                              </td>
                              <td className='px-6 py-3'>
                                <span className='font-mono text-xs font-bold text-slate-600'>{doc.vehicleNumber}</span>
                              </td>
                              <td className='px-6 py-3 text-xs font-medium text-slate-500'>{doc.validFrom}</td>
                              <td className='px-6 py-3 text-xs font-medium text-slate-500'>{doc.validTo}</td>
                              <td className='px-6 py-3 text-right'>
                                <span className='rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black uppercase text-blue-600'>{timeAgo(doc.createdAt)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {showAddVehicleModal && (
        <AddVehicleModal
          isOpen={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          onSuccess={() => {
            setShowAddVehicleModal(false)
            fetchVehicles()
          }}
          editData={null}
        />
      )}

      {showAddInsuranceModal && (
        <AddInsuranceModal
          isOpen={showAddInsuranceModal}
          onClose={() => {
            setShowAddInsuranceModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddInsuranceModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showUploadOptions && (
        <div className='fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-slate-900'>Upload Insurance</h2>
              <button onClick={() => setShowUploadOptions(false)} className='text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className='space-y-4'>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group text-left'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <div>
                  <p className='text-base font-black text-slate-900'>AI Upload</p>
                  <p className='text-xs text-slate-500 font-medium mt-0.5'>Upload document &amp; auto-fill details</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*,application/pdf'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setShowUploadOptions(false)
                    setInitialExtractionFile(file)
                    setShowAddInsuranceModal(true)
                  }
                  e.target.value = ''
                }}
              />
              <button
                type='button'
                onClick={() => {
                  setShowUploadOptions(false)
                  setInitialExtractionFile(null)
                  setShowAddInsuranceModal(true)
                }}
                className='w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all group text-left'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg group-hover:scale-110 transition-transform'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                  </svg>
                </div>
                <div>
                  <p className='text-base font-black text-slate-900'>Manual Upload</p>
                  <p className='text-xs text-slate-500 font-medium mt-0.5'>Fill insurance details manually</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
