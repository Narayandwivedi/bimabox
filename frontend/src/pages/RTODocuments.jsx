import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import AddFitnessModal from './Fitness/AddFitnessModal'
import AddPucModal from './Puc/AddPucModal'
import AddGpsModal from './Gps/AddGpsModal'
import AddTaxModal from './Tax/AddTaxModal'
import AddPermitModal from './Permit/components/AddPermitModal'
import AddRcModal from './Rc/AddRcModal'
import EditFitnessModal from './Fitness/EditFitnessModal'
import EditPucModal from './Puc/EditPucModal'
import EditGpsModal from './Gps/EditGpsModal'
import EditTaxModal from './Tax/EditTaxModal'
import EditPermitModal from './Permit/components/EditPermitModal'
import EditRcModal from './Rc/EditRcModal'
import ImportModal from '../components/ImportModal'


const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"


const CustomDropdown = ({ value, onChange, options, label, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative flex-1 min-w-[120px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border-2 transition-all duration-200 px-3 py-2.5 text-[11px] font-black focus:outline-none ${
          isOpen ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/10' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className={isOpen ? 'text-blue-500' : 'text-slate-400'}>{icon}</span>}
          <span className="truncate">{label}: {selectedOption.label}</span>
        </div>
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[70] mt-2 max-h-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col">
          <div className="p-2 border-b border-slate-50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                autoFocus
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-8 pr-2 text-[10px] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-4.5 text-[11px] font-bold transition-all duration-150 ${
                    value === option.value
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
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
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-[10px] font-bold text-slate-400">No {label.toLowerCase()} found</p>
              </div>
            )}
          </div>
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
  const [showAddFitnessModal, setShowAddFitnessModal] = useState(false)
  const [showAddPucModal, setShowAddPucModal] = useState(false)
  const [showAddGpsModal, setShowAddGpsModal] = useState(false)
  const [showAddTaxModal, setShowAddTaxModal] = useState(false)
  const [showAddPermitModal, setShowAddPermitModal] = useState(false)
  const [showAddRcModal, setShowAddRcModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [initialExtractionFile, setInitialExtractionFile] = useState(null)
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
        { type: 'Permit', url: `${API_URL}/api/permit`, fromField: 'validFrom', toField: 'validTo' },
        { type: 'RC', url: `${API_URL}/api/rc`, fromField: null, toField: null },
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
            validFrom: ep.fromField ? (record[ep.fromField] || 'N/A') : 'N/A',
            validTo: ep.toField ? (record[ep.toField] || 'N/A') : 'N/A',
            status: ep.type === 'RC' ? 'Active' : (record.status === 'active' ? 'Active' : (record.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired')),
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

  const totalDocs = documents.length
  const activeDocs = documents.filter(d => d.status === 'Active').length
  const expiringDocs = documents.filter(d => d.status === 'Expiring Soon').length
  const expiredDocs = documents.filter(d => d.status === 'Expired').length

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter
      const matchesType = typeFilter === 'All' || doc.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

  const handleExport = () => {
    if (!filteredDocuments.length) return
    const exportData = filteredDocuments.map((doc) => {
      const record = doc.rawRecord || {}
      return {
        'Type': doc.type === 'Tax' ? 'Road Tax' : doc.type,
        'Vehicle Number': doc.vehicleNumber || '',
        'Holder Name': record.ownerName || record.policyHolderName || record.name || '',
        'Mobile': record.mobileNumber || '',
        'Valid From': doc.validFrom !== 'N/A' ? doc.validFrom : '',
        'Valid To': doc.validTo !== 'N/A' ? doc.validTo : '',
        'Status': doc.status,
        'Remarks': record.remarks || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RTO Documents')
    XLSX.writeFile(wb, `rto_documents_${typeFilter}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

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
      case 'RC': return (
        <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
        </svg>
      )
      default: return '📄'
    }
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-2 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-6xl mx-auto'>
            {/* Quick Action Buttons */}
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <div>
                  <h1 className='text-xl md:text-2xl font-black text-slate-900'>RTO Documents</h1>
                  <p className='text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]'>Manage all your vehicle documents</p>
                </div>
                <div className='flex items-center gap-2'>
                  {filteredDocuments.length > 0 && (
                    <button
                      type='button'
                      onClick={handleExport}
                      className='flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-200'
                    >
                      <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                      Export Excel
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={() => setShowImportModal(true)}
                    className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95'
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 4v16m8-8H4' />
                    </svg>
                    Add
                  </button>
                </div>
              </div>

              {/* Stats Summary */}
              {!loading && documents.length > 0 && (
                <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-4'>
                  {[
                    { label: 'Total Documents', value: totalDocs, color: 'bg-slate-900', textColor: 'text-slate-900', iconBg: 'bg-slate-100', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { label: 'Active', value: activeDocs, color: 'bg-emerald-600', textColor: 'text-emerald-700', iconBg: 'bg-emerald-100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Expiring Soon', value: expiringDocs, color: 'bg-amber-500', textColor: 'text-amber-700', iconBg: 'bg-amber-100', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Expired', value: expiredDocs, color: 'bg-rose-600', textColor: 'text-rose-700', iconBg: 'bg-rose-100', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                  ].map((stat) => (
                    <div key={stat.label} className='relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm transition-all hover:shadow-md'>
                      <div className='flex items-center gap-2 md:gap-3'>
                        <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                          <svg className={`h-4 w-4 md:h-5 md:w-5 ${stat.textColor}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={stat.icon} />
                          </svg>
                        </div>
                        <div>
                          <p className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide'>{stat.label}</p>
                          <p className={`text-sm md:text-lg font-black ${stat.textColor}`}>{stat.value}</p>
                        </div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.color} opacity-30`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Search & Filters */}
              <div className='mb-6 flex flex-col md:flex-row md:items-center gap-3 w-full'>
                <div className='relative w-full md:w-80 md:flex-shrink-0'>
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
                    className='w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-black text-slate-900 placeholder:text-[10px] md:placeholder:text-xs placeholder:text-slate-400 placeholder:font-semibold focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase'
                  />
                </div>

                <div className='flex flex-col md:flex-row gap-2 flex-1 w-full'>
                  <div className='flex gap-2 flex-1 md:flex-initial md:w-96'>
                    <CustomDropdown
                      label="Type"
                      value={typeFilter}
                      onChange={(val) => {
                        setTypeFilter(val)
                      }}
                      options={[
                        { value: 'All', label: 'All' },
                        { value: 'Tax', label: 'Road Tax' },
                        { value: 'PUC', label: 'PUC' },
                        { value: 'GPS', label: 'GPS' },
                        { value: 'Fitness', label: 'Fitness' },
                        { value: 'Permit', label: 'Permit' },
                        { value: 'RC', label: 'RC' },
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
                </div>
              </div>

              {/* Document List */}
              {loading ? (
                <div className='mt-6 text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
                  <p className='text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest'>Loading documents...</p>
                </div>
              ) : (
                <>
                  {/* Mobile View (Cards) */}
                  <div className='grid gap-4 sm:grid-cols-2 lg:hidden'>
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => navigate(`/rto-documents/${doc.type}/${doc.id}`)}
                        className='group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-0.5 cursor-pointer'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 group-hover:scale-110 group-hover:ring-blue-200 transition-all'>
                              <span className='text-lg'>{getDocTypeIcon(doc.type)}</span>
                            </div>
                            <div>
                              <h3 className='text-sm font-black text-slate-900'>{doc.type === 'Tax' ? 'Road Tax' : doc.type}</h3>
                              <p className='text-[10px] font-black tracking-wider text-slate-400 uppercase font-mono'>{doc.vehicleNumber}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-black uppercase leading-none tracking-wider shadow-sm ring-1 ring-inset ${getStatusColor(doc.status)}`}>
                            {doc.status === 'Expiring Soon' ? 'Expiring' : doc.status}
                          </span>
                        </div>
                        <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3'>
                          <div className='flex gap-5'>
                            <div>
                              <p className='text-[8px] font-black uppercase tracking-wider text-slate-400'>From</p>
                              <p className='text-xs font-bold text-slate-700'>{doc.validFrom}</p>
                            </div>
                            <div>
                              <p className='text-[8px] font-black uppercase tracking-wider text-slate-400'>To</p>
                              <p className='text-xs font-black text-slate-900'>{doc.validTo}</p>
                            </div>
                          </div>
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={(e) => handleEditClick(e, doc)}
                              className='rounded-lg bg-blue-50/80 p-1.5 text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-700 transition-all'
                              title="Edit Record"
                            >
                              <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingDoc(doc) }}
                              className='rounded-lg bg-red-50/80 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all'
                              title="Delete Record"
                            >
                              <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View (Table) */}
                  <div className='hidden lg:block'>
                    <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                      <table className='w-full text-left'>
                        <thead>
                          <tr className='bg-slate-50/50 border-b border-slate-100'>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Type</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Vehicle</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid From</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Valid To</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right'>Status</th>
                            <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-50'>
                          {filteredDocuments.map((doc, idx) => (
                            <tr
                              key={doc.id}
                              onClick={() => navigate(`/rto-documents/${doc.type}/${doc.id}`)}
                              className='group cursor-pointer transition-all hover:bg-blue-50/40'
                              style={{ animationDelay: `${idx * 30}ms` }}
                            >
                              <td className='px-6 py-4'>
                                <div className='flex items-center gap-3'>
                                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-200 group-hover:scale-110 transition-all'>
                                    <span className='text-sm'>{getDocTypeIcon(doc.type)}</span>
                                  </div>
                                  <div>
                                    <span className='text-sm font-extrabold text-slate-800'>{doc.type === 'Tax' ? 'Road Tax' : doc.type}</span>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='font-mono text-xs font-extrabold text-slate-600'>{doc.vehicleNumber}</span>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='text-xs font-semibold text-slate-500'>{doc.validFrom}</span>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='text-xs font-bold text-slate-700'>{doc.validTo}</span>
                              </td>
                              <td className='px-6 py-4 text-right'>
                                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase leading-none tracking-wider shadow-sm ring-1 ring-inset ${getStatusColor(doc.status)}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500' : doc.status === 'Expiring Soon' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                  {doc.status === 'Expiring Soon' ? 'Expiring' : doc.status}
                                </span>
                              </td>
                              <td className='px-6 py-4 text-right'>
                                <div className='flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <button
                                    onClick={(e) => handleEditClick(e, doc)}
                                    className='rounded-lg bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-all hover:scale-110'
                                    title="Edit Record"
                                  >
                                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingDoc(doc) }}
                                    className='rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all hover:scale-110'
                                    title="Delete Record"
                                  >
                                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {!loading && filteredDocuments.length === 0 && (
                <div className='mt-6 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner'>
                    <svg className='h-10 w-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 11v4m0 2h.01' opacity='0.5' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-black text-slate-800'>No Documents Found</h3>
                  <p className='mt-1 text-xs font-semibold text-slate-400'>Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

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
              Are you sure you want to delete this {deletingDoc.type === 'Tax' ? 'Road Tax' : deletingDoc.type} record for <span className="font-bold">{deletingDoc.vehicleNumber}</span>? This action cannot be undone.
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
      {editingDoc?.type === 'RC' && (
        <EditRcModal
          isOpen={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          onSubmit={handleEditSubmit}
          rc={editingDoc.rawRecord}
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
            toast.success('Fitness record added successfully')
            fetchAllDocuments()
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
            toast.success('Road Tax record added successfully')
            fetchAllDocuments()
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
            toast.success('PUC record added successfully')
            fetchAllDocuments()
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
            toast.success('GPS record added successfully')
            fetchAllDocuments()
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
            toast.success('Permit record added successfully')
            fetchAllDocuments()
          }}
          initialExtractionFile={initialExtractionFile}
        />
      )}

      {showAddRcModal && (
        <AddRcModal
          isOpen={showAddRcModal}
          onClose={() => {
            setShowAddRcModal(false)
            setInitialExtractionFile(null)
          }}
          onSubmit={() => {
            setShowAddRcModal(false)
            toast.success('RC record added successfully')
            fetchAllDocuments()
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
            const modalMap = {
              puc: () => setShowAddPucModal(true),
              fitness: () => setShowAddFitnessModal(true),
              tax: () => setShowAddTaxModal(true),
              gps: () => setShowAddGpsModal(true),
              permit: () => setShowAddPermitModal(true),
              rc: () => setShowAddRcModal(true),
            }
            modalMap[type]?.()
          }}
        />
      )}
    </div>
  )
}

export default RTODocuments
