import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const PAGE_SIZE = 40

const Search = () => {
  const [searchMode, setSearchMode] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchModes = [
    { key: 'name', label: 'Name' },
    { key: 'vehicle', label: 'Vehicle No.' },
    { key: 'mobile', label: 'Mobile No.' },
  ]

  const fetchRecords = useCallback(async (pageNum, append = false) => {
    if (!inputValue.trim()) return
    const q = inputValue.trim()
    setSearchQuery(q)
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    setSearched(true)

    try {
      const res = await axios.get(`${API_URL}/api/insurance`, {
        withCredentials: true,
        params: { search: q, limit: PAGE_SIZE, page: pageNum },
      })

      if (res.data.success) {
        const data = res.data.data
        const pagination = res.data.pagination

        if (append) {
          setRecords(prev => [...prev, ...data])
        } else {
          setRecords(data)
        }

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
  }, [inputValue])

  const handleSearch = () => {
    setRecords([])
    setPage(1)
    fetchRecords(1, false)
  }

  const handleLoadMore = () => {
    fetchRecords(page + 1, true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getStatusBadge = (record) => {
    if (!record.validTo) return null
    const parts = record.validTo.split('-')
    if (parts.length !== 3) return null
    const expiry = new Date(`${parts[1]}-${parts[0]}-${parts[2]}`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { label: 'Expired', class: 'bg-rose-100 text-rose-700' }
    if (diff <= 30) return { label: `${diff}d left`, class: 'bg-amber-100 text-amber-700' }
    return { label: 'Active', class: 'bg-emerald-100 text-emerald-700' }
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-4 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-6xl mx-auto'>
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <div className='mb-6'>
                <h1 className='text-xl md:text-2xl font-black text-slate-900'>Search Insurance</h1>
                <p className='text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]'>Find insurance records by name, vehicle, or mobile number</p>
              </div>

              <div className='mb-4'>
                <div className='flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 w-fit'>
                  {searchModes.map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setSearchMode(mode.key)}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        searchMode === mode.key
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <svg className='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <input
                    type='text'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search by ${searchModes.find(m => m.key === searchMode)?.label.toLowerCase()}...`}
                    className='w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-black text-slate-900 placeholder:text-[10px] md:placeholder:text-xs placeholder:text-slate-400 placeholder:font-semibold focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase'
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !inputValue.trim()}
                  className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                  Search
                </button>
              </div>

              {loading && (
                <div className='mt-6 text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                  <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Searching records...</p>
                </div>
              )}

              {!loading && searched && records.length === 0 && (
                <div className='mt-6 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner'>
                    <svg className='h-10 w-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-black text-slate-800'>No Records Found</h3>
                  <p className='mt-1 text-xs font-semibold text-slate-400'>Try a different search term.</p>
                </div>
              )}

              {!loading && records.length > 0 && (
                <>
                  <div className='mt-6 mb-3 flex items-center justify-between'>
                    <p className='text-xs font-bold text-slate-500'>
                      Showing <span className='text-slate-800'>{records.length}</span> of <span className='text-slate-800'>{totalRecords}</span> results
                    </p>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    {records.map((record) => {
                      const badge = getStatusBadge(record)
                      return (
                        <div
                          key={record._id}
                          className='group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-0.5'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1 min-w-0'>
                              <h3 className='text-sm font-black text-slate-900 truncate'>
                                {record.policyHolderName || 'Unknown'}
                              </h3>
                              <p className='text-[10px] font-black tracking-wider text-slate-400 uppercase font-mono'>
                                {record.vehicleNumber || 'N/A'}
                              </p>
                              {record.mobileNumber && (
                                <p className='text-[10px] font-bold text-slate-400 mt-0.5'>
                                  {record.mobileNumber}
                                </p>
                              )}
                              {record.insuranceCompany && (
                                <span className='mt-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[8px] font-extrabold text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap'>
                                  {record.insuranceCompany}
                                </span>
                              )}
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
                                <p className='text-xs font-black text-slate-900'>{record.validTo || 'N/A'}</p>
                              </div>
                            </div>
                            {record.policyNumber && (
                              <span className='text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]'>
                                {record.policyNumber}
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

              {!loading && !searched && (
                <div className='mt-6 text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner'>
                    <svg className='h-12 w-12 text-blue-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-black text-slate-800'>Search Insurance Records</h3>
                  <p className='mt-1 text-xs font-semibold text-slate-400'>Enter a name, vehicle number, or mobile number to search.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Search
