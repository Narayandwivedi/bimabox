import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const DOCUMENT_TYPES = ['Aadhar', 'PAN', 'GST', 'Other']

const KycPage = () => {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const fileInputRef = useRef(null)
  const aadharFrontRef = useRef(null)
  const aadharBackRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    documentType: 'Aadhar',
    otherDocumentType: '',
    documentNumber: '',
    aadharFrontFile: null,
    aadharBackFile: null,
    documentFile: null,
    remarks: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [search])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search.trim()) params.search = search.trim()
      const response = await axios.get(`${API_URL}/api/kyc`, { params, withCredentials: true })
      if (response.data.success) {
        setRecords(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching KYC records:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingRecord(null)
    setForm({
      name: '',
      documentType: 'Aadhar',
      otherDocumentType: '',
      documentNumber: '',
      aadharFrontFile: null,
      aadharBackFile: null,
      documentFile: null,
      remarks: ''
    })
    setShowModal(true)
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    setForm({
      name: record.name || '',
      documentType: record.documentType || 'Aadhar',
      otherDocumentType: record.otherDocumentType || '',
      documentNumber: record.documentNumber || '',
      aadharFrontFile: null,
      aadharBackFile: null,
      documentFile: null,
      remarks: record.remarks || ''
    })
    setShowModal(true)
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        documentType: form.documentType,
        otherDocumentType: form.documentType === 'Other' ? form.otherDocumentType : '',
        documentNumber: form.documentNumber,
        remarks: form.remarks
      }

      if (form.documentType === 'Aadhar') {
        if (form.aadharFrontFile) payload.aadharFrontDocument = await toBase64(form.aadharFrontFile)
        if (form.aadharBackFile) payload.aadharBackDocument = await toBase64(form.aadharBackFile)
      } else {
        if (form.documentFile) payload.documentImage = await toBase64(form.documentFile)
      }

      if (editingRecord) {
        await axios.put(`${API_URL}/api/kyc/${editingRecord._id}`, payload, { withCredentials: true })
      } else {
        await axios.post(`${API_URL}/api/kyc`, payload, { withCredentials: true })
      }

      setShowModal(false)
      fetchRecords()
      toast.success(editingRecord ? 'KYC updated successfully!' : 'KYC added successfully!', { autoClose: 1500 })
    } catch (error) {
      console.error('Error saving KYC record:', error)
      toast.error(error.response?.data?.message || 'Failed to save KYC record', { autoClose: 1500 })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this KYC record?')) return
    try {
      await axios.delete(`${API_URL}/api/kyc/${id}`, { withCredentials: true })
      fetchRecords()
    } catch (error) {
      console.error('Error deleting KYC record:', error)
    }
  }

  const openPreview = (url, title) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
  }

  const getDocumentUrl = (record) => {
    if (record.documentType === 'Aadhar') {
      return record.aadharFrontDocument || record.aadharBackDocument
    }
    return record.documentImage
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-2 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-7xl mx-auto'>
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6'>
                <h1 className='text-xl font-black text-slate-900'>KYC Records</h1>
                <button
                  type='button'
                  onClick={openAddModal}
                  className='px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition cursor-pointer'
                >
                  + Add KYC
                </button>
              </div>

              <div className='mb-4'>
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search by name...'
                  className='w-full max-w-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm'
                />
              </div>

              {loading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto'></div>
                </div>
              ) : records.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <p className='text-sm font-bold text-slate-500'>No KYC records found.</p>
                </div>
              ) : (
                <>
                  <div className='space-y-3 lg:hidden'>
                    {records.map((record) => (
                      <div key={record._id} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <p className='text-sm font-bold text-slate-800'>{record.name}</p>
                            <p className='text-[11px] font-semibold text-indigo-600'>{record.documentType}{record.documentType === 'Other' && record.otherDocumentType ? ` (${record.otherDocumentType})` : ''}</p>
                          </div>
                          <div className='flex gap-1'>
                            <button onClick={() => openEditModal(record)} className='p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer' title='Edit'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(record._id)} className='p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer' title='Delete'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {record.documentNumber && <p className='text-[11px] text-slate-500 font-mono mb-2'>No: {record.documentNumber}</p>}
                        <div className='flex gap-2'>
                          {record.documentType === 'Aadhar' ? (
                            <>
                              {record.aadharFrontDocument && (
                                <button onClick={() => openPreview(API_URL + record.aadharFrontDocument, 'Aadhar Front')} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>View Front</button>
                              )}
                              {record.aadharBackDocument && (
                                <button onClick={() => openPreview(API_URL + record.aadharBackDocument, 'Aadhar Back')} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>View Back</button>
                              )}
                            </>
                          ) : (
                            record.documentImage && (
                              <button onClick={() => openPreview(API_URL + record.documentImage, record.documentType)} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>View Document</button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='hidden lg:block overflow-hidden rounded-2xl border border-slate-100 bg-white'>
                    <table className='w-full text-left'>
                      <thead>
                        <tr className='border-b border-slate-100 bg-slate-50/50'>
                          <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Name</th>
                          <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Document Type</th>
                          <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Document No</th>
                          <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400'>Documents</th>
                          <th className='px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right'>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-50'>
                        {records.map((record) => (
                          <tr key={record._id} className='transition-colors hover:bg-slate-50/50'>
                            <td className='px-6 py-3'>
                              <span className='text-sm font-bold text-slate-700'>{record.name}</span>
                            </td>
                            <td className='px-6 py-3'>
                              <span className='text-xs font-semibold text-indigo-600'>{record.documentType}{record.documentType === 'Other' && record.otherDocumentType ? ` (${record.otherDocumentType})` : ''}</span>
                            </td>
                            <td className='px-6 py-3'>
                              <span className='font-mono text-xs text-slate-500'>{record.documentNumber || '—'}</span>
                            </td>
                            <td className='px-6 py-3'>
                              <div className='flex gap-2'>
                                {record.documentType === 'Aadhar' ? (
                                  <>
                                    {record.aadharFrontDocument && (
                                      <button onClick={() => openPreview(API_URL + record.aadharFrontDocument, 'Aadhar Front')} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>Front</button>
                                    )}
                                    {record.aadharBackDocument && (
                                      <button onClick={() => openPreview(API_URL + record.aadharBackDocument, 'Aadhar Back')} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>Back</button>
                                    )}
                                  </>
                                ) : (
                                  record.documentImage && (
                                    <button onClick={() => openPreview(API_URL + record.documentImage, record.documentType)} className='text-xs text-indigo-600 font-semibold hover:underline cursor-pointer'>View</button>
                                  )
                                )}
                                {!getDocumentUrl(record) && <span className='text-xs text-slate-400'>—</span>}
                              </div>
                            </td>
                            <td className='px-6 py-3 text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <button onClick={() => openEditModal(record)} className='px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer'>Edit</button>
                                <button onClick={() => handleDelete(record._id)} className='px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer'>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div className='fixed inset-0 bg-black/60 z-[60] flex items-start md:items-center justify-center p-2 pt-12 md:p-4'>
          <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
            <div className='bg-gradient-to-r from-indigo-600 to-blue-600 p-3 md:p-4 text-white flex-shrink-0'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-lg md:text-2xl font-bold'>{editingRecord ? 'Edit KYC' : 'Add New KYC'}</h2>
                  <p className='text-indigo-100 text-xs md:text-sm mt-1'>{editingRecord ? 'Update KYC record' : 'Add new KYC record'}</p>
                </div>
                <button onClick={() => setShowModal(false)} className='text-white hover:bg-white/20 rounded-lg p-1.5 md:p-2 transition cursor-pointer'>
                  <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
              <div className='flex-1 overflow-y-auto p-3 md:p-6'>
                <div className='bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
                  <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                    <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                    Personal Details
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Full Name <span className='text-red-500'>*</span></label>
                      <input type='text' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder='Enter full name' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white' required />
                    </div>
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Document Type <span className='text-red-500'>*</span></label>
                      <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm'>
                        {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Document Number</label>
                      <input type='text' value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} placeholder='Document number' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm bg-white' />
                    </div>
                    {form.documentType === 'Other' && (
                      <div className='md:col-span-2'>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Specify Document Type <span className='text-red-500'>*</span></label>
                        <input type='text' value={form.otherDocumentType} onChange={(e) => setForm({ ...form, otherDocumentType: e.target.value })} placeholder='e.g. Driving License' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white' />
                      </div>
                    )}
                  </div>
                </div>

                <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
                  <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                    <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                    Documents
                  </h3>
                  {form.documentType === 'Aadhar' ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Aadhar Front</label>
                        <div className='relative overflow-hidden'>
                          <button type='button' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 text-left bg-white hover:border-purple-400 transition cursor-pointer truncate'>
                            <span className='flex items-center gap-2'>
                              <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                              </svg>
                              {form.aadharFrontFile ? form.aadharFrontFile.name : 'Upload Front'}
                            </span>
                          </button>
                          <input ref={aadharFrontRef} type='file' accept='image/*,application/pdf' onChange={(e) => setForm({ ...form, aadharFrontFile: e.target.files[0] })} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                        </div>
                      </div>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Aadhar Back</label>
                        <div className='relative overflow-hidden'>
                          <button type='button' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 text-left bg-white hover:border-purple-400 transition cursor-pointer truncate'>
                            <span className='flex items-center gap-2'>
                              <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                              </svg>
                              {form.aadharBackFile ? form.aadharBackFile.name : 'Upload Back'}
                            </span>
                          </button>
                          <input ref={aadharBackRef} type='file' accept='image/*,application/pdf' onChange={(e) => setForm({ ...form, aadharBackFile: e.target.files[0] })} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Document</label>
                      <div className='relative overflow-hidden'>
                        <button type='button' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 text-left bg-white hover:border-purple-400 transition cursor-pointer truncate'>
                          <span className='flex items-center gap-2'>
                            <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                            </svg>
                            {form.documentFile ? form.documentFile.name : 'Upload document (image/PDF)'}
                          </span>
                        </button>
                        <input ref={fileInputRef} type='file' accept='image/*,application/pdf' onChange={(e) => setForm({ ...form, documentFile: e.target.files[0] })} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                      </div>
                    </div>
                  )}
                </div>

                <div className='bg-gradient-to-r from-slate-50 to-indigo-50 border-2 border-slate-200 rounded-xl p-3 md:p-6'>
                  <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                    <span className='bg-slate-700 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                    Additional
                  </h3>
                  <div>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Remarks</label>
                    <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows='2' placeholder='Optional remarks...' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none bg-white' />
                  </div>
                </div>
              </div>

              <div className='border-t border-gray-200 p-3 md:p-4 bg-gray-50 flex flex-col md:flex-row justify-end items-center gap-3 flex-shrink-0'>
                <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
                  <button type='button' onClick={() => setShowModal(false)} className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer'>Cancel</button>
                  <button type='submit' className='flex-1 md:flex-none px-6 md:px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    {editingRecord ? 'Update KYC' : 'Add KYC'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className='fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4' onClick={() => setPreviewUrl(null)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden' onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-center p-4 border-b border-slate-200'>
              <h3 className='text-sm font-bold text-slate-800'>{previewTitle}</h3>
              <button onClick={() => setPreviewUrl(null)} className='text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className='p-4'>
              {previewUrl.toLowerCase().includes('.pdf') ? (
                <iframe src={previewUrl} title={previewTitle} className='w-full h-96 rounded-xl border border-slate-200' />
              ) : (
                <img src={previewUrl} alt={previewTitle} className='w-full max-h-96 object-contain rounded-xl' />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KycPage
