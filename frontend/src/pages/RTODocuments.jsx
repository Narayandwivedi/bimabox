import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import SearchBar from '../components/SearchBar'
import AddVehicleModal from './VehicleRegistration/components/AddVehicleModal'
import EditFitnessModal from './Fitness/components/EditFitnessModal'
import EditPucModal from './Puc/components/EditPucModal'
import EditGpsModal from './Gps/components/EditGpsModal'
import EditTaxModal from './Tax/components/EditTaxModal'
import EditPermitModal from './Permit/components/EditPermitModal'
import AddInsuranceModal from './Insurance/components/AddInsuranceModal'


const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

const CustomDropdown = ({ value, onChange, options, label, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative flex-1 min-w-[120px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border-2 transition-all duration-200 px-3 py-2.5 text-[11px] font-black focus:outline-none ${
          isOpen ? 'border-indigo-500 bg-white shadow-lg ring-4 ring-indigo-500/10' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className={isOpen ? 'text-indigo-500' : 'text-slate-400'}>{icon}</span>}
          <span className="truncate">{label}: {selectedOption.label}</span>
        </div>
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[70] mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-white py-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1.5 mb-1 border-b border-slate-50">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select {label}</span>
          </div>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-4 py-4.5 text-[11px] font-bold transition-all duration-150 ${
                value === option.value
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {value === option.value && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RTODocuments = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [editingDoc, setEditingDoc] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAllDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        { type: 'Tax', url: `${API_URL}/api/tax`, fromField: 'taxFrom', toField: 'taxTo' },
        { type: 'PUC', url: `${API_URL}/api/puc`, fromField: 'validFrom', toField: 'validTo' },
        { type: 'GPS', url: `${API_URL}/api/gps`, fromField: 'validFrom', toField: 'validTo' },
        { type: 'Fitness', url: `${API_URL}/api/fitness`, fromField: 'validFrom', toField: 'validTo' },
        { type: 'Insurance', url: `${API_URL}/api/insurance`, fromField: 'validFrom', toField: 'validTo' },
        { type: 'Permit', url: `${API_URL}/api/permit`, fromField: 'validFrom', toField: 'validTo' },
      ];

      const requests = endpoints.map(ep => axios.get(ep.url, { withCredentials: true, params: { limit: 1000 } }));
      const responses = await Promise.allSettled(requests);
      
      let allDocs = [];
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.success) {
          const ep = endpoints[index];
          const records = response.value.data.data.map(record => ({
            id: record._id,
            type: ep.type,
            vehicleNumber: record.vehicleNumber,
            validFrom: record[ep.fromField] || 'N/A',
            validTo: record[ep.toField] || 'N/A',
            status: record.status === 'active' ? 'Active' : (record.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired'),
            rawRecord: record
          }));
          allDocs = [...allDocs, ...records];
        }
      });

      setDocuments(allDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return
    setIsDeleting(true)
    const typeLower = deletingDoc.type.toLowerCase()
    try {
      const res = await axios.delete(`${API_URL}/api/${typeLower}/${deletingDoc.id}`, { withCredentials: true })
      if (res.data.success) {
        toast.success(`${deletingDoc.type} record deleted successfully`)
        setDeletingDoc(null)
        fetchAllDocuments()
      } else {
        toast.error('Failed to delete record')
      }
    } catch {
      toast.error('Failed to delete record')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSubmit = async (formData) => {
    if (!editingDoc) return
    const typeLower = editingDoc.type.toLowerCase()
    try {
      await axios.put(`${API_URL}/api/${typeLower}/${editingDoc.id}`, formData, { withCredentials: true })
      toast.success('Record updated successfully')
      setEditingDoc(null)
      fetchAllDocuments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record')
    }
  }

  const handleEditClick = (e, doc) => {
    e.stopPropagation();
    setEditingDoc(doc)
  }

  const statusPriority = { 'Active': 1, 'Expiring Soon': 2, 'Expired': 3 }

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter
      const matchesType = typeFilter === 'All' || doc.type === typeFilter
      const matchesCompany = typeFilter === 'Insurance' ? (companyFilter === 'All' || doc.rawRecord.insuranceCompany === companyFilter) : true
      return matchesSearch && matchesStatus && matchesType && matchesCompany
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
          <h1 className='text-lg md:text-xl font-black text-slate-900'>RTO Documents</h1>
          <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>see all your record here</p>
        </div>

        {/* Search & Filters Bar */}
        <div className='mb-6 flex flex-col gap-3'>
          {/* Search Row */}
          <div className='relative w-full'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <svg className='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by vehicle or type...'
              className='w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-black text-slate-900 placeholder:text-[10px] placeholder:text-slate-400 placeholder:font-semibold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase'
            />
          </div>

          {/* Filters Row */}
          <div className='flex flex-col gap-2'>
            {/* Type & Status Row */}
            <div className='flex gap-2'>
              <CustomDropdown
                label="Type"
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val)
                  setCompanyFilter('All')
                }}
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Tax', label: 'Tax' },
                  { value: 'PUC', label: 'PUC' },
                  { value: 'GPS', label: 'GPS' },
                  { value: 'Fitness', label: 'Fitness' },
                  { value: 'Permit', label: 'Permit' },
                  { value: 'Insurance', label: 'Insurance' },
                ]}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />

              <CustomDropdown
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'All', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Expiring Soon', label: 'Expiring' },
                  { value: 'Expired', label: 'Expired' },
                ]}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
            </div>

            {/* Company Row (Full Width) */}
            {typeFilter === 'Insurance' && (
              <div className='w-full'>
                <CustomDropdown
                  label="Company"
                  value={companyFilter}
                  onChange={setCompanyFilter}
                  options={[
                    { value: 'All', label: 'All Companies' },
                    { value: "HDFC ERGO", label: "HDFC ERGO" },
                    { value: "ICICI Lombard", label: "ICICI Lombard" },
                    { value: "Bajaj Allianz", label: "Bajaj Allianz" },
                    { value: "Tata AIG", label: "Tata AIG" },
                    { value: "Reliance General", label: "Reliance General" },
                    { value: "IFFCO Tokio", label: "IFFCO Tokio" },
                    { value: "National Insurance", label: "National Insurance" },
                    { value: "New India Assurance", label: "New India Assurance" },
                    { value: "Oriental Insurance", label: "Oriental Insurance" },
                    { value: "United India Insurance", label: "United India Insurance" },
                    { value: "Magma HDI", label: "Magma HDI" },
                    { value: "Go Digit", label: "Go Digit" },
                    { value: "Acko", label: "Acko" },
                    { value: "Cholamandalam MS", label: "Cholamandalam MS" },
                    { value: "Future Generali", label: "Future Generali" },
                    { value: "Royal Sundaram", label: "Royal Sundaram" },
                    { value: "SBI General", label: "SBI General" },
                    { value: "Shriram General", label: "Shriram General" },
                    { value: "Liberty General", label: "Liberty General" },
                    { value: "Universal Sompo", label: "Universal Sompo" },
                  ]}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Document Cards List */}
        {loading ? (
          <div className='mt-12 flex justify-center items-center flex-col gap-4'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
            <p className='text-sm font-semibold text-slate-500'>Loading documents...</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/rto-documents/${doc.type}/${doc.id}`)}
                className='group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all hover:border-indigo-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 cursor-pointer'
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
                    <div className='flex items-center justify-between'>
                      <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold border shadow-sm ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between border-t border-slate-50 pt-2.5 mt-1.5'>
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
                    <div className='flex items-center gap-1.5'>
                      <button
                        onClick={(e) => handleEditClick(e, doc)}
                        className='rounded-lg bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors'
                        title="Edit Record"
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingDoc(doc) }}
                        className='rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors'
                        title="Delete Record"
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
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

      {deletingDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-800">Delete Record</h3>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete this {deletingDoc.type} record for <span className="font-bold">{deletingDoc.vehicleNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingDoc(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingDoc?.type === 'Fitness' && (
        <EditFitnessModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSuccess={() => {
            setEditingDoc(null)
            fetchAllDocuments()
          }}
          fitness={editingDoc.rawRecord}
        />
      )}
      {editingDoc?.type === 'Tax' && (
        <EditTaxModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={handleEditSubmit}
          tax={editingDoc.rawRecord}
        />
      )}
      {editingDoc?.type === 'PUC' && (
        <EditPucModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={handleEditSubmit}
          puc={editingDoc.rawRecord}
        />
      )}
      {editingDoc?.type === 'GPS' && (
        <EditGpsModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={handleEditSubmit}
          gps={editingDoc.rawRecord}
        />
      )}
      {editingDoc?.type === 'Permit' && (
        <EditPermitModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={handleEditSubmit}
          permit={editingDoc.rawRecord}
        />
      )}
      {editingDoc?.type === 'Insurance' && (
        <AddInsuranceModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={async () => {
            setEditingDoc(null)
            await fetchAllDocuments()
          }}
          initialData={editingDoc.rawRecord}
          isEditMode={true}
        />
      )}
    </div>
  )
}

export default RTODocuments
