import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SearchBar from '../components/SearchBar'
import AddVehicleModal from './VehicleRegistration/components/AddVehicleModal'
import AddFitnessModal from './Fitness/components/AddFitnessModal'
import AddTaxModal from './Tax/components/AddTaxModal'
import AddPucModal from './Puc/components/AddPucModal'
import AddGpsModal from './Gps/components/AddGpsModal'
import AddInsuranceModal from './Insurance/components/AddInsuranceModal'
import AddPermitModal from './Permit/components/AddPermitModal'
import ImportModal from '../components/ImportModal'
import { parseDate } from '../utils/dateFormatter'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Home = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showAddFitnessModal, setShowAddFitnessModal] = useState(false)
  const [showAddTaxModal, setShowAddTaxModal] = useState(false)
  const [showAddPucModal, setShowAddPucModal] = useState(false)
  const [showAddGpsModal, setShowAddGpsModal] = useState(false)
  const [showAddInsuranceModal, setShowAddInsuranceModal] = useState(false)
  const [showAddPermitModal, setShowAddPermitModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [expiryFilter, setExpiryFilter] = useState(30)
  const [initialExtractionFile, setInitialExtractionFile] = useState(null)
  const [realExpiringDocs, setRealExpiringDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  
  useEffect(() => {
    fetchVehicles()
    fetchExpiringDocs()
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
          <div className='max-w-6xl mx-auto'>
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
                  onClick={() => setShowImportModal(true)}
                  className='flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-slate-100/50 hover:shadow-xl group'
                >
                  <div className='flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform'>
                    <svg className='h-5 w-5 md:h-6 md:w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                    </svg>
                  </div>
                  <span className='text-[10px] md:text-sm font-bold text-slate-900'>Upload Documents</span>
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

                    {/* Desktop View (Table) */}
                    <div className='hidden lg:block'>
                      <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                        <table className='w-full text-left'>
                          <thead>
                            <tr className='bg-slate-50/50 border-b border-slate-100'>
                              <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Document</th>
                              <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Vehicle</th>
                              <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Expiry Date</th>
                              <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right'>Status</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-slate-50'>
                            {loadingDocs ? (
                              <tr>
                                <td colSpan='4' className='px-6 py-12 text-center'>
                                  <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                                  <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Synchronizing Data...</p>
                                </td>
                              </tr>
                            ) : filteredDocs.length === 0 ? (
                              <tr>
                                <td colSpan='4' className='px-6 py-12 text-center text-slate-500 font-bold'>No documents expiring soon.</td>
                              </tr>
                            ) : (
                              filteredDocs.map((doc) => (
                                <tr key={doc.id} className='group hover:bg-slate-50/50 transition-colors'>
                                  <td className='px-6 py-4'>
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
                                  <td className='px-6 py-4'>
                                    <span className='text-xs font-mono font-bold text-slate-600'>{doc.vehicleNumber}</span>
                                  </td>
                                  <td className='px-6 py-4 text-xs text-slate-500 font-medium'>{doc.validTo}</td>
                                  <td className='px-6 py-4 text-right'>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${doc.daysLeft <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                      {doc.daysLeft < 0 ? 'Expired' : doc.daysLeft === 0 ? 'Today' : `${doc.daysLeft}d left`}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )
              })()}
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

      {showAddFitnessModal && (
        <AddFitnessModal
          isOpen={showAddFitnessModal}
          onClose={() => {
            setShowAddFitnessModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddFitnessModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showAddTaxModal && (
        <AddTaxModal
          isOpen={showAddTaxModal}
          onClose={() => {
            setShowAddTaxModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddTaxModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showAddPucModal && (
        <AddPucModal
          isOpen={showAddPucModal}
          onClose={() => {
            setShowAddPucModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddPucModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showAddGpsModal && (
        <AddGpsModal
          isOpen={showAddGpsModal}
          onClose={() => {
            setShowAddGpsModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddGpsModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
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

      {showAddPermitModal && (
        <AddPermitModal
          isOpen={showAddPermitModal}
          onClose={() => {
            setShowAddPermitModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddPermitModal(false)
            fetchExpiringDocs()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onProceed={(type, method, file) => {
            setShowImportModal(false)
            setInitialExtractionFile(method === 'ai' ? file : null)
            if (type === 'insurance') setShowAddInsuranceModal(true)
            else if (type === 'puc') setShowAddPucModal(true)
            else if (type === 'fitness') setShowAddFitnessModal(true)
            else if (type === 'tax') setShowAddTaxModal(true)
            else if (type === 'gps') setShowAddGpsModal(true)
            else if (type === 'permit') setShowAddPermitModal(true)
          }}
        />
      )}
    </div>
  )
}

export default Home
