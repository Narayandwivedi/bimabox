import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddInsuranceModal from './Insurance/components/AddInsuranceModal'
import EditFitnessModal from './Fitness/components/EditFitnessModal'
import EditPucModal from './Puc/components/EditPucModal'
import EditGpsModal from './Gps/components/EditGpsModal'
import EditTaxModal from './Tax/components/EditTaxModal'
import EditPermitModal from './Permit/components/EditPermitModal'

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

const Search = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('Insurance') // Default to Insurance
  const [statusFilter, setStatusFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDoc, setEditingDoc] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [companies, setCompanies] = useState([])

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
      let insuranceCompanies = new Set();
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.success) {
          const ep = endpoints[index];
          const records = response.value.data.data.map(record => {
            if (ep.type === 'Insurance' && record.insuranceCompany) {
              insuranceCompanies.add(record.insuranceCompany);
            }
            return {
              id: record._id,
              type: ep.type,
              vehicleNumber: record.vehicleNumber,
              partyName: record.policyHolderName || record.ownerName || 'N/A',
              company: record.insuranceCompany || 'N/A',
              validFrom: record[ep.fromField] || 'N/A',
              validTo: record[ep.toField] || 'N/A',
              status: record.status === 'active' ? 'Active' : (record.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired'),
              rawRecord: record
            };
          });
          allDocs = [...allDocs, ...records];
        }
      });

      setDocuments(allDocs);
      setCompanies(Array.from(insuranceCompanies).sort());
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    
    let matchesStatus = true;
    if (typeFilter === 'Insurance') {
      matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    } else {
      // For other types, we might want status filter too? User specifically asked for it for insurance.
      matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    }

    let matchesCompany = true;
    if (typeFilter === 'Insurance') {
      matchesCompany = companyFilter === 'All' || doc.company === companyFilter;
    }

    return matchesSearch && matchesType && matchesStatus && matchesCompany;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700'
      case 'Expired': return 'bg-rose-100 text-rose-700'
      case 'Expiring Soon': return 'bg-amber-100 text-amber-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 px-4 pb-32 pt-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-black text-slate-900'>Global Search</h1>
          <p className='text-xs font-bold text-slate-500 uppercase tracking-widest'>Search across all your documents</p>
        </div>

        {/* Search & Filter Bar */}
        <div className='bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 space-y-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by Vehicle No or Party Name...'
              className='w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-[11px] md:text-sm font-bold text-slate-900 placeholder:text-[10px] md:placeholder:text-sm focus:border-blue-500 focus:outline-none transition-all'
            />
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>Doc Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  if (e.target.value !== 'Insurance') {
                    setCompanyFilter('All');
                  }
                }}
                className='rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none'
              >
                <option value='All'>All Documents</option>
                <option value='Insurance'>Insurance</option>
                <option value='Tax'>Tax</option>
                <option value='PUC'>PUC</option>
                <option value='GPS'>GPS</option>
                <option value='Fitness'>Fitness</option>
                <option value='Permit'>Permit</option>
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none'
              >
                <option value='All'>All Status</option>
                <option value='Active'>Active</option>
                <option value='Expiring Soon'>Expiring Soon</option>
                <option value='Expired'>Expired</option>
              </select>
            </div>

            {typeFilter === 'Insurance' && (
              <div className='flex flex-col gap-1 col-span-2 md:col-span-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>Insurance Company</label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className='rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none'
                >
                  <option value='All'>All Companies</option>
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className='py-12 flex flex-col items-center gap-4'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent'></div>
            <p className='text-sm font-bold text-slate-400 uppercase tracking-widest'>Searching Documents...</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/rto-documents/${doc.type}/${doc.id}`)}
                className='bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform'>
                      {doc.type === 'Insurance' ? '🛡️' : doc.type === 'Tax' ? '💰' : doc.type === 'PUC' ? '🌬️' : doc.type === 'GPS' ? '📍' : doc.type === 'Fitness' ? '🔧' : '📜'}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-sm font-black text-slate-900'>{doc.vehicleNumber}</h3>
                        <span className='px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 uppercase'>{doc.type}</span>
                      </div>
                      <p className='text-xs font-bold text-slate-500 mt-0.5'>{doc.partyName}</p>
                      {doc.type === 'Insurance' && <p className='text-[10px] font-bold text-blue-600 uppercase mt-0.5'>{doc.company}</p>}
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <p className='text-[10px] font-bold text-slate-400 mt-2'>Exp: {doc.validTo}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className='py-20 text-center'>
                <div className='text-4xl mb-4'>🔍</div>
                <h3 className='text-lg font-black text-slate-900'>No Results Found</h3>
                <p className='text-sm font-bold text-slate-400'>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals for Editing (if needed from this page) */}
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
    </div>
  )
}

export default Search
