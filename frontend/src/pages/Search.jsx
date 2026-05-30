import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const PAGE_SIZE = 40

const INSURANCE_COMPANIES = [
  'HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz', 'Tata AIG', 'Reliance General',
  'IFFCO Tokio', 'National Insurance', 'New India Assurance', 'Oriental Insurance',
  'United India Insurance', 'Magma HDI', 'Go Digit', 'Acko', 'Cholamandalam MS',
  'Future Generali', 'Royal Sundaram', 'SBI General', 'Shriram General',
  'Liberty General', 'Universal Sompo', 'Kotak General', 'Zuno General',
  'Raheja QBE', 'Navi General', 'Star Health'
]

const PRODUCT_TYPES = [
  'GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W',
  'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC'
]

const POLICY_TYPES = [
  'Comprehensive', 'Third Party'
]

const Search = () => {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filterCompany, setFilterCompany] = useState('')
  const [filterProductType, setFilterProductType] = useState('')
  const [filterPolicyType, setFilterPolicyType] = useState('')
  const [filterValidity, setFilterValidity] = useState('')
  const filterPanelRef = useRef(null)
  const debounceRef = useRef(null)

  const activeFilterCount = [filterCompany, filterProductType, filterPolicyType, filterValidity].filter(Boolean).length

  const fetchRecords = useCallback(async (pageNum, append = false, query = '', company = '', productType = '', policyType = '', validity = '') => {
    const q = query.trim()
    setSearchQuery(q)
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    setSearched(true)

    try {
      const params = { search: q, limit: PAGE_SIZE, page: pageNum }
      if (company) params.insuranceCompany = company
      if (productType) params.product = productType
      if (policyType) params.insuranceClass = policyType
      if (validity) params.validity = validity

      const res = await axios.get(`${API_URL}/api/insurance`, {
        withCredentials: true,
        params,
      })

      if (res.data.success) {
        const data = res.data.data
        const pagination = res.data.pagination
        if (append) setRecords(prev => [...prev, ...data])
        else setRecords(data)
        setPage(pagination.currentPage)
        setTotalRecords(pagination.totalRecords)
        setHasMore(pagination.currentPage < pagination.totalPages)
      }
    } catch (err) {
      console.error('Search error:', err)
      if (!append) setRecords([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchRecords(1, false, '', '', '', '', '')
  }, [fetchRecords])

  // Trigger search immediately on input change (each keystroke) and filter changes
  useEffect(() => {
    setRecords([])
    setPage(1)
    fetchRecords(1, false, inputValue, filterCompany, filterProductType, filterPolicyType, filterValidity)
  }, [inputValue, filterCompany, filterProductType, filterPolicyType, filterValidity, fetchRecords])

  // Close filter panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setShowFilterPanel(false)
      }
    }
    if (showFilterPanel) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFilterPanel])

  const handleLoadMore = () => {
    fetchRecords(page + 1, true, searchQuery, filterCompany, filterProductType, filterPolicyType, filterValidity)
  }

  const handleClearFilters = () => {
    setFilterCompany('')
    setFilterProductType('')
    setFilterPolicyType('')
    setFilterValidity('')
  }

  // Validity filter applied client-side on loaded records

  const getValidityDays = (rec) => {
    if (!rec.validTo) return null
    const parts = rec.validTo.split('-')
    if (parts.length !== 3) return null
    const expiry = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  }

  const filteredRecords = records

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null
    const parts = dateStr.split('-')
    if (parts.length !== 3) return null
    const expiry = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusBadge = (record) => {
    if (!record.validTo) return null
    const parts = record.validTo.split('-')
    if (parts.length !== 3) return null
    const expiry = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: 'Expired', class: 'bg-rose-100 text-rose-700 ring-rose-600/20' }
    if (diff <= 30) return { label: `${diff}d left`, class: 'bg-amber-100 text-amber-700 ring-amber-600/20' }
    return { label: 'Active', class: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' }
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-4 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-6xl mx-auto'>
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>

              {/* Header */}
              <div className='mb-6 flex items-center justify-between'>
                <div>
                  <h1 className='text-lg md:text-2xl font-black text-slate-900'>Search Insurance</h1>
                  <p className='text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5'>Browse all insurance records</p>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className='text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1'
                  >
                    <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>

              {/* Search Bar + Filter Icon */}
              <div className='flex gap-2 items-center relative'>
                <div className='relative flex-1'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    {loading ? (
                      <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full' />
                    ) : (
                      <svg className='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                      </svg>
                    )}
                  </div>
                  <input
                    type='text'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder='Search by name, vehicle number, policy...'
                    className='w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-black text-slate-900 placeholder:text-[10px] md:placeholder:text-xs placeholder:text-slate-400 placeholder:font-semibold focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase'
                  />
                </div>

                {/* Filter Icon Button */}
                <div className='relative' ref={filterPanelRef}>
                  <button
                    onClick={() => setShowFilterPanel(prev => !prev)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${showFilterPanel || activeFilterCount > 0
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:shadow-md'
                      }`}
                    title='Filter'
                  >
                    <svg className='w-4.5 h-4.5' style={{ width: '18px', height: '18px' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
                    </svg>
                    {activeFilterCount > 0 && (
                      <span className='absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow'>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Filter Dropdown Panel */}
                  {showFilterPanel && (
                    <>
                      {/* Overlay backdrop */}
                      <div
                        className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:bg-black/20'
                        onClick={() => setShowFilterPanel(false)}
                      />

                      <div className='fixed inset-0 z-50 flex items-center justify-center'>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`
                            bg-white lg:bg-white/80 lg:backdrop-blur-xl
                            rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/50
                            overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150
                            w-72 lg:w-[30rem]
                          `}
                        >
                          {/* Panel Header */}
                           <div className='flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
                            <div className='flex items-center gap-2'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
                              </svg>
                              <span className='text-sm font-bold'>Filters</span>
                            </div>
                            <div className='flex items-center gap-3'>
                              {activeFilterCount > 0 && (
                                <button
                                  onClick={handleClearFilters}
                                  className='text-[10px] font-bold text-white/85 hover:text-white transition-colors underline underline-offset-2'
                                >
                                  Clear all
                                </button>
                              )}
                              <button
                                onClick={() => setShowFilterPanel(false)}
                                className='text-white/85 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10'
                                title='Close'
                              >
                                <svg className='w-4.5 h-4.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className='p-4 lg:p-6 space-y-4 lg:space-y-5'>

                            {/* Insurance Company */}
                            <div>
                              <label className='block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5'>
                                Insurance Company
                              </label>
                              <div className='relative'>
                                <select
                                  value={filterCompany}
                                  onChange={(e) => setFilterCompany(e.target.value)}
                                  className='w-full appearance-none rounded-xl border-2 border-slate-200 bg-white py-2 lg:py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer'
                                >
                                  <option value=''>All Companies</option>
                                  {INSURANCE_COMPANIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                  <svg className='w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                                  </svg>
                                </div>
                              </div>
                              {filterCompany && (
                                <div className='mt-1.5 flex items-center justify-between'>
                                  <span className='text-[10px] font-bold text-blue-600 truncate max-w-[200px]'>{filterCompany}</span>
                                  <button onClick={() => setFilterCompany('')} className='text-slate-400 hover:text-rose-500 transition-colors ml-1'>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Product Type */}
                            <div>
                              <label className='block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5'>
                                Product Type
                              </label>
                              <div className='relative'>
                                <select
                                  value={filterProductType}
                                  onChange={(e) => setFilterProductType(e.target.value)}
                                  className='w-full appearance-none rounded-xl border-2 border-slate-200 bg-white py-2 lg:py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer'
                                >
                                  <option value=''>All Product Types</option>
                                  {PRODUCT_TYPES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                  <svg className='w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                                  </svg>
                                </div>
                              </div>
                              {filterProductType && (
                                <div className='mt-1.5 flex items-center justify-between'>
                                  <span className='text-[10px] font-bold text-blue-600 truncate max-w-[200px]'>{filterProductType}</span>
                                  <button onClick={() => setFilterProductType('')} className='text-slate-400 hover:text-rose-500 transition-colors ml-1'>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Policy Type */}
                            <div>
                              <label className='block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5'>
                                Policy Type
                              </label>
                              <div className='relative'>
                                <select
                                  value={filterPolicyType}
                                  onChange={(e) => setFilterPolicyType(e.target.value)}
                                  className='w-full appearance-none rounded-xl border-2 border-slate-200 bg-white py-2 lg:py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer'
                                >
                                  <option value=''>All Policy Types</option>
                                  {POLICY_TYPES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                  <svg className='w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                                  </svg>
                                </div>
                              </div>
                              {filterPolicyType && (
                                <div className='mt-1.5 flex items-center justify-between'>
                                  <span className='text-[10px] font-bold text-blue-600 truncate max-w-[200px]'>{filterPolicyType}</span>
                                  <button onClick={() => setFilterPolicyType('')} className='text-slate-400 hover:text-rose-500 transition-colors ml-1'>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Validity */}
                            <div>
                              <label className='block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5'>
                                Validity Period
                              </label>
                              <div className='relative'>
                                <select
                                  value={filterValidity}
                                  onChange={(e) => setFilterValidity(e.target.value)}
                                  className='w-full appearance-none rounded-xl border-2 border-slate-200 bg-white py-2 lg:py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer'
                                >
                                  <option value=''>All — Any Validity</option>
                                  <option value='expired'>❌ Expired</option>
                                  <option value='7'>⚠️ Expires in 7 Days</option>
                                  <option value='30'>🔔 Expires in 30 Days</option>
                                  <option value='45'>🔔 Expires in 45 Days</option>
                                  <option value='60'>✅ Expires in 60 Days</option>
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                  <svg className='w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                                  </svg>
                                </div>
                              </div>
                              {filterValidity && (
                                <div className='mt-1.5 flex items-center justify-between'>
                                  <span className='text-[10px] font-bold text-blue-600 truncate max-w-[200px]'>
                                    {filterValidity === 'expired' ? 'Expired' : `Expires in ${filterValidity} Days`}
                                  </span>
                                  <button onClick={() => setFilterValidity('')} className='text-slate-400 hover:text-rose-500 transition-colors ml-1'>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Close button */}
                            <button
                              onClick={() => setShowFilterPanel(false)}
                              className='w-full py-2 lg:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs lg:text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 active:scale-95'
                            >
                              Apply Filters
                              {activeFilterCount > 0 && (
                                <span className='ml-2 bg-white/30 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md'>
                                  {activeFilterCount} active
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {filterCompany && (
                    <span className='inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-200'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' />
                      </svg>
                      {filterCompany}
                      <button onClick={() => setFilterCompany('')} className='ml-0.5 hover:text-rose-500 transition-colors'>
                        <svg className='w-2.5 h-2.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterProductType && (
                    <span className='inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700 ring-1 ring-inset ring-purple-200'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                      {filterProductType}
                      <button onClick={() => setFilterProductType('')} className='ml-0.5 hover:text-rose-500 transition-colors'>
                        <svg className='w-2.5 h-2.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterPolicyType && (
                    <span className='inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                      </svg>
                      {filterPolicyType}
                      <button onClick={() => setFilterPolicyType('')} className='ml-0.5 hover:text-rose-500 transition-colors'>
                        <svg className='w-2.5 h-2.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterValidity && (
                    <span className='inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      {filterValidity === 'expired' ? 'Expired' : `Expires in ${filterValidity} Days`}
                      <button onClick={() => setFilterValidity('')} className='ml-0.5 hover:text-rose-700 transition-colors'>
                        <svg className='w-2.5 h-2.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className='mt-6 text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                  <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Loading records...</p>
                </div>
              )}

              {/* No Results */}
              {!loading && searched && records.length === 0 && (
                <div className='mt-6 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner'>
                    <svg className='h-10 w-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-black text-slate-800'>No Records Found</h3>
                  <p className='mt-1 text-xs font-semibold text-slate-400'>
                    {activeFilterCount > 0 ? 'Try adjusting your filters.' : 'Try a different search term.'}
                  </p>
                  {activeFilterCount > 0 && (
                    <button onClick={handleClearFilters} className='mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2'>
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Results */}
              {!loading && records.length > 0 && (
                <>
                  <div className='mt-6 mb-3 flex items-center justify-between'>
                    <p className='text-xs font-bold text-slate-500'>
                      Showing <span className='text-slate-800'>{filteredRecords.length}</span> of <span className='text-slate-800'>{totalRecords}</span> results
                    </p>
                    {activeFilterCount > 0 && (
                      <span className='text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg'>
                        {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                      </span>
                    )}
                  </div>

                  {filteredRecords.length === 0 && filterValidity && (
                    <div className='text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                      <p className='text-sm font-black text-slate-400'>No records match the validity filter</p>
                      <button onClick={() => setFilterValidity('')} className='mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2'>Clear validity filter</button>
                    </div>
                  )}

                  <div className='grid gap-4 sm:grid-cols-2'>
                    {filteredRecords.map((record) => {
                      const badge = getStatusBadge(record)
                      return (
                        <div
                          key={record._id}
                          onClick={() => navigate(`/rto-documents/Insurance/${record._id}`)}
                          className='group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-0.5 cursor-pointer'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <h3 className='text-xs sm:text-sm font-black text-slate-900 truncate sm:overflow-visible sm:whitespace-normal max-w-[200px] sm:max-w-none'>
                                  {record.policyHolderName || 'Unknown Holder'}
                                </h3>
                                {record.premium != null && (
                                  <span className='inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-sm'>
                                    ₹{record.premium.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                              <p className='text-[10px] font-black tracking-wider text-slate-400 uppercase font-mono mt-0.5'>
                                {record.vehicleNumber || 'N/A'}
                              </p>
                              {record.mobileNumber && (
                                <p className='text-[10px] font-bold text-slate-400 mt-0.5'>{record.mobileNumber}</p>
                              )}
                              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                                {record.insuranceCompany && (
                                  <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap shadow-sm'>
                                    {record.insuranceCompany}
                                  </span>
                                )}
                                {record.product && (
                                  <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[9px] font-black text-purple-700 ring-1 ring-inset ring-purple-700/10 whitespace-nowrap shadow-sm'>
                                    {record.product}
                                  </span>
                                )}
                                {record.insuranceClass && (
                                  <span className='inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700 ring-1 ring-inset ring-indigo-700/10 whitespace-nowrap shadow-sm'>
                                    {record.insuranceClass}
                                  </span>
                                )}
                              </div>
                            </div>
                            {badge && (
                              <span className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-black uppercase leading-none tracking-wider shadow-sm ring-1 ring-inset ${badge.class}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                          <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3'>
                            <div className='flex gap-5'>
                              <div>
                                <p className='text-[8px] font-black uppercase tracking-wider text-slate-400'>From</p>
                                <p className='text-xs font-bold text-slate-700'>{record.validFrom || 'N/A'}</p>
                              </div>
                              <div>
                                <p className='text-[8px] font-black uppercase tracking-wider text-slate-400'>To</p>
                                <p className='text-xs font-black text-slate-900'>
                                  {record.validTo || 'N/A'}
                                  {(() => {
                                    const days = getDaysLeft(record.validTo)
                                    if (days === null) return null
                                    return (
                                      <span className='text-rose-600 ml-1'>{'('}{days}d{')'}</span>
                                    )
                                  })()}
                                </p>
                              </div>
                            </div>
                            {record.policyNumber && (
                              <span className='self-start sm:self-auto -mt-1 sm:mt-0 text-[9px] font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150 uppercase tracking-wider truncate sm:overflow-visible sm:whitespace-normal max-w-[130px] sm:max-w-none shadow-sm'>
                                <span className='sm:hidden'>{record.policyNumber.slice(0, 10)}</span>
                                <span className='hidden sm:inline'>{record.policyNumber}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {hasMore && (
                    <div className='mt-8 text-center'>
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className='inline-flex items-center gap-2 rounded-xl bg-white border-2 border-slate-200 px-8 py-3 text-xs font-black text-slate-700 uppercase tracking-wider transition-all hover:border-blue-400 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-100/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {loadingMore ? (
                          <>
                            <div className='animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full'></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
                            </svg>
                            Load More
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Search
