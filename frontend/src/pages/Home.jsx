import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import AddVehicleModal from './VehicleRegistration/components/AddVehicleModal'
import AddFitnessModal from './Fitness/components/AddFitnessModal'
import AddTaxModal from './Tax/components/AddTaxModal'
import AddPucModal from './Puc/components/AddPucModal'
import AddGpsModal from './Gps/components/AddGpsModal'
import AddInsuranceModal from './Insurance/components/AddInsuranceModal'
import ImportModal from '../components/ImportModal'

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
  const [showImportModal, setShowImportModal] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [expiryFilter, setExpiryFilter] = useState(15)
  
  const demoExpiringDocs = [
    { id: 1, type: 'Insurance', vehicleNumber: 'MH01AB1234', validFrom: '01-05-2023', validTo: '30-04-2024', daysLeft: 2, color: 'blue' },
    { id: 2, type: 'Tax', vehicleNumber: 'DL04CD5678', validFrom: '15-05-2023', validTo: '14-05-2024', daysLeft: 10, color: 'emerald' },
    { id: 3, type: 'PUC', vehicleNumber: 'KA03EF9012', validFrom: '20-10-2023', validTo: '19-04-2024', daysLeft: 5, color: 'amber' },
    { id: 4, type: 'Fitness', vehicleNumber: 'TS07GH3456', validFrom: '05-05-2023', validTo: '04-05-2024', daysLeft: 12, color: 'rose' },
    { id: 5, type: 'GPS', vehicleNumber: 'HR26IJ7890', validFrom: '12-05-2023', validTo: '11-05-2024', daysLeft: 7, color: 'indigo' },
  ]

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await axios.get(`${API_URL}/api/vehicle`, {
          params: {
            page: 1,
            limit: 1000,
          },
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

  const filteredVehicles = vehicles.filter((vehicle) => {
    const vehicleNumber = String(vehicle.registrationNumber || vehicle.vehicleNumber || '').toUpperCase()
    return vehicleNumber.includes(searchQuery.trim().toUpperCase())
  })

  const openAddVehicleModal = () => {
    setShowMobileSidebar(false)
    setShowAddVehicleModal(true)
  }

  const openAddFitnessModal = () => {
    setShowMobileSidebar(false)
    setShowAddFitnessModal(true)
  }

  const openAddTaxModal = () => {
    setShowMobileSidebar(false)
    setShowAddTaxModal(true)
  }

  const openAddPucModal = () => {
    setShowMobileSidebar(false)
    setShowAddPucModal(true)
  }

  const openAddGpsModal = () => {
    setShowMobileSidebar(false)
    setShowAddGpsModal(true)
  }

  const openAddInsuranceModal = () => {
    setShowMobileSidebar(false)
    setShowAddInsuranceModal(true)
  }

return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='pl-2 pr-4 pt-6 pb-32 lg:pl-3 lg:pr-8 lg:pt-8'>
        <section className='w-full'>
          <div className='max-w-5xl mx-auto'>

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

              <div className='space-y-3'>
                 {demoExpiringDocs
                  .filter(doc => (doc.vehicleNumber.includes(searchQuery.toUpperCase()) || doc.type.toUpperCase().includes(searchQuery.toUpperCase())) && doc.daysLeft <= expiryFilter)
                  .map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/document/${doc.id}`)}
                    className='group relative cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all hover:border-slate-400 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
                  >
                    <div className='flex flex-col gap-2.5'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${doc.color}-50 text-${doc.color}-600 shadow-sm border border-${doc.color}-100`}>
                            {doc.type === 'Insurance' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>}
                            {doc.type === 'Tax' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>}
                            {doc.type === 'PUC' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>}
                            {doc.type === 'Fitness' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' /></svg>}
                            {doc.type === 'GPS' && <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>}
                          </div>
                          <div>
                            <h3 className='text-sm font-bold text-slate-900'>{doc.type}</h3>
                            <p className='text-[10px] font-black tracking-wider text-slate-500 uppercase'>{doc.vehicleNumber}</p>
                          </div>
                        </div>
                        <div className={`rounded-full bg-${doc.color}-50 px-2.5 py-1 text-[10px] font-bold text-${doc.color}-700 border border-${doc.color}-100 shadow-sm`}>
                          {doc.daysLeft} days left
                        </div>
                      </div>

                      <div className='flex items-center justify-between border-t border-slate-50 pt-2.5'>
                        <div className='flex gap-6'>
                          <div>
                            <p className='text-[9px] font-bold uppercase tracking-tight text-slate-400'>From</p>
                            <p className='text-[11px] font-semibold text-slate-700'>{doc.validFrom}</p>
                          </div>
                          <div>
                            <p className='text-[9px] font-bold uppercase tracking-tight text-slate-400'>To</p>
                            <p className='text-[11px] font-bold text-slate-900'>{doc.validTo}</p>
                          </div>
                        </div>
                        <button className='rounded-lg bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          onClose={() => setShowAddFitnessModal(false)}
          onSubmit={() => {
            setShowAddFitnessModal(false)
          }}
        />
      )}

      {showAddTaxModal && (
        <AddTaxModal
          isOpen={showAddTaxModal}
          onClose={() => setShowAddTaxModal(false)}
          onSubmit={() => {
            setShowAddTaxModal(false)
          }}
        />
      )}

      {showAddPucModal && (
        <AddPucModal
          isOpen={showAddPucModal}
          onClose={() => setShowAddPucModal(false)}
          onSubmit={() => {
            setShowAddPucModal(false)
          }}
        />
      )}

      {showAddGpsModal && (
        <AddGpsModal
          isOpen={showAddGpsModal}
          onClose={() => setShowAddGpsModal(false)}
          onSubmit={() => {
            setShowAddGpsModal(false)
          }}
        />
      )}

      {showAddInsuranceModal && (
        <AddInsuranceModal
          isOpen={showAddInsuranceModal}
          onClose={() => setShowAddInsuranceModal(false)}
          onSubmit={() => {
            setShowAddInsuranceModal(false)
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  )
}

export default Home

