import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import AddVehicleModal from './VehicleRegistration/components/AddVehicleModal'

const RTODocuments = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)

  // Demo data for all document types
  const demoDocuments = [
    { id: 1, type: 'Tax', vehicleNumber: 'MH01AB1234', validFrom: '2023-01-01', validTo: '2023-12-31', status: 'Active' },
    { id: 2, type: 'PUC', vehicleNumber: 'MH01AB1234', validFrom: '2024-01-15', validTo: '2024-07-15', status: 'Active' },
    { id: 3, type: 'GPS', vehicleNumber: 'MH01AB1234', validFrom: '2023-06-01', validTo: '2024-06-01', status: 'Active' },
    { id: 4, type: 'Fitness', vehicleNumber: 'DL01XY9876', validFrom: '2022-10-10', validTo: '2024-10-10', status: 'Active' },
    { id: 5, type: 'Permit', vehicleNumber: 'DL01XY9876', validFrom: '2023-05-05', validTo: '2025-05-05', status: 'Active' },
    { id: 6, type: 'Tax', vehicleNumber: 'KA05CD5678', validFrom: '2023-03-01', validTo: '2024-03-01', status: 'Expired' },
    { id: 7, type: 'PUC', vehicleNumber: 'KA05CD5678', validFrom: '2023-09-01', validTo: '2024-03-01', status: 'Expiring Soon' },
    { id: 8, type: 'Insurance', vehicleNumber: 'MH12EF4321', validFrom: '2023-11-11', validTo: '2024-11-10', status: 'Active' },
  ]

  const statusPriority = { 'Active': 1, 'Expiring Soon': 2, 'Expired': 3 }

  const filteredDocuments = demoDocuments
    .filter(doc => {
      const matchesSearch = doc.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter
      const matchesType = typeFilter === 'All' || doc.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700'
      case 'Expired': return 'bg-rose-100 text-rose-700'
      case 'Expiring Soon': return 'bg-amber-100 text-amber-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getDocTypeIcon = (type) => {
    switch(type) {
      case 'Tax': return '💰'
      case 'PUC': return '🌬️'
      case 'GPS': return (
        <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
        </svg>
      )
      case 'Fitness': return '🔧'
      case 'Permit': return '📜'
      case 'Insurance': return '🛡️'
      default: return '📄'
    }
  }

  return (
    <div className='min-h-screen bg-slate-100 px-4 pb-32 pt-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        {/* Header Section */}
        <div className='mb-4'>
          <h1 className='text-xl font-black text-slate-900'>RTO Documents</h1>
          <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>Master Document Repository</p>
        </div>

        {/* Search & Filters Bar */}
        <div className='mb-6 flex items-center gap-1.5'>
          <div className='relative flex-1 min-w-0'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none'>
              <svg className='w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search...'
              className='w-full rounded-xl border-2 border-slate-200 bg-white py-2 pl-8 pr-2 text-[10px] font-black text-slate-900 placeholder:text-[9px] placeholder:text-slate-400 placeholder:font-semibold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase'
            />
          </div>

          <div className='flex gap-1 shrink-0'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='rounded-xl border-2 border-slate-200 bg-white px-1.5 py-2 text-[9px] font-black text-slate-700 focus:border-indigo-500 focus:outline-none'
            >
              <option value='All'>Status</option>
              <option value='Active'>Active</option>
              <option value='Expiring Soon'>Expiring</option>
              <option value='Expired'>Expired</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className='rounded-xl border-2 border-slate-200 bg-white px-1.5 py-2 text-[9px] font-black text-slate-700 focus:border-indigo-500 focus:outline-none'
            >
              <option value='All'>Type</option>
              <option value='Tax'>Tax</option>
              <option value='PUC'>PUC</option>
              <option value='GPS'>GPS</option>
              <option value='Fitness'>Fitness</option>
              <option value='Permit'>Permit</option>
              <option value='Insurance'>Insurance</option>
            </select>
          </div>
        </div>

        {/* Document Cards List */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/document/${doc.id}`)}
              className='group relative cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all hover:border-slate-400 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
            >
              <div className='flex flex-col gap-2.5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform'>
                      <span className='text-xl'>{getDocTypeIcon(doc.type)}</span>
                    </div>
                    <div>
                      <h3 className='text-sm font-bold text-slate-900'>{doc.type}</h3>
                      <p className='text-[10px] font-black tracking-wider text-slate-500 uppercase'>{doc.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold border shadow-sm ${getStatusColor(doc.status)}`}>
                    {doc.status}
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

        {filteredDocuments.length === 0 && (
          <div className='mt-12 text-center'>
            <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-4xl shadow-inner grayscale opacity-50'>
              🔍
            </div>
            <h3 className='text-xl font-black text-slate-900'>No Documents Found</h3>
            <p className='text-sm font-semibold text-slate-400'>Try searching with a different vehicle number or type.</p>
          </div>
        )}
      </div>

      {showAddVehicleModal && (
        <AddVehicleModal
          isOpen={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          onSuccess={() => setShowAddVehicleModal(false)}
        />
      )}
    </div>
  )
}

export default RTODocuments
