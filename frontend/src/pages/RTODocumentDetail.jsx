import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import EditFitnessModal from './Fitness/EditFitnessModal'
import EditPucModal from './Puc/EditPucModal'
import EditGpsModal from './Gps/EditGpsModal'
import EditTaxModal from './Tax/EditTaxModal'
import EditPermitModal from './Permit/components/EditPermitModal'
import EditRcModal from './Rc/EditRcModal'
import AddInsuranceModal from './Insurance/AddInsuranceModal'


const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// --- Helpers ---
const TYPE_CONFIG = {
  Tax: {
    apiPath: 'tax',
    documentField: 'taxDocument',
    icon: '💰',
    color: 'emerald',
    fromField: 'taxFrom',
    toField: 'taxTo',
    extraFields: [
      { label: 'Owner Name', key: 'ownerName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
      { label: 'Road Tax Amount', key: 'taxAmount', prefix: '₹' },
      { label: 'Total Amount', key: 'totalAmount', prefix: '₹' },
      { label: 'Paid Amount', key: 'paidAmount', prefix: '₹' },
      { label: 'Balance Amount', key: 'balanceAmount', prefix: '₹' },
    ],
  },
  PUC: {
    apiPath: 'puc',
    documentField: 'pucDocument',
    icon: '🌬️',
    color: 'sky',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Owner Name', key: 'ownerName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
    ],
  },
  GPS: {
    apiPath: 'gps',
    documentField: 'gpsDocument',
    icon: '📍',
    color: 'violet',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Owner Name', key: 'ownerName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
    ],
  },
  Fitness: {
    apiPath: 'fitness',
    documentField: 'fitnessDocument',
    icon: '🔧',
    color: 'amber',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Owner Name', key: 'ownerName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
      { label: 'Party ID', key: 'partyId' },
    ],
  },
  Insurance: {
    apiPath: 'insurance',
    documentField: 'insuranceDocument',
    endorsementField: 'endorsementDocument',
    icon: '🛡️',
    color: 'blue',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Policy Number', key: 'policyNumber' },
      { label: 'Policy Holder', key: 'policyHolderName' },
      { label: 'Insurance Company', key: 'insuranceCompany' },
      { label: 'Product', key: 'product' },
      { label: 'Premium', key: 'premium', prefix: '₹' },
      { label: 'Mobile Number', key: 'mobileNumber' },
      { label: 'Issue Date', key: 'issueDate' },
      { label: 'Client Name', key: 'reference' },
      { label: 'Agent name (IMD)', key: 'imd' },
      { label: 'Claim Raised', key: 'claimRaised' },
      { label: 'Claim Date', key: 'claimDate' },
      { label: 'Claim Remarks', key: 'claimRemarks' },
      { label: 'Remarks', key: 'remarks' },
      { label: 'Notes', key: 'notes' },
    ],
  },
  Permit: {
    apiPath: 'permit',
    documentField: 'permitDocument',
    icon: '📜',
    color: 'teal',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Name', key: 'name' }
    ],
  },
  RC: {
    apiPath: 'rc',
    documentField: 'rcFrontImage',
    icon: '📋',
    color: 'orange',
    fromField: null,
    toField: null,
    extraFields: [
      { label: 'Chassis No', key: 'chassisNo' },
      { label: 'Engine No', key: 'engineNo' },
      { label: 'Make', key: 'make' },
      { label: 'Model', key: 'model' },
    ],
  },
}

const STATUS_STYLES = {
  active: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
  expiring_soon: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Expiring Soon' },
  expired: { badge: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Expired' },
  unknown: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Unknown' },
}

const isPdf = (url) => url && (url.toLowerCase().includes('.pdf') || url.startsWith('data:application/pdf'))

const RcImageBlock = ({ url, label, apiUrl }) => {
  const fullUrl = url && (url.startsWith('http') || url.startsWith('data:') ? url : `${apiUrl}${url}`)

  const handleDownload = async () => {
    if (!fullUrl) return
    try {
      const res = await fetch(fullUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `RC_${label.replace(/\s/g, '_')}.${blob.type.split('/')[1] || 'png'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(fullUrl, '_blank')
    }
  }

  return fullUrl ? (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          RC {label}
        </h3>
        <button onClick={handleDownload} className='flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm cursor-pointer'>
          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
          </svg>
          Download
        </button>
      </div>
      <div className="relative bg-slate-50 min-h-[200px] flex items-center justify-center p-2">
        <img src={fullUrl} alt={`RC ${label}`} className="w-full object-contain rounded-lg" style={{ maxHeight: '400px' }} />
      </div>
    </div>
  ) : null
}

// --- Component ---
const RTODocumentDetail = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfError, setPdfError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const config = TYPE_CONFIG[type]

  const fetchRecord = async () => {
    if (!config) return
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/${config.apiPath}/${id}`, { withCredentials: true })
      if (res.data?.success) {
        setRecord(res.data.data)
      } else {
        setError('Record not found.')
      }
    } catch {
      setError('Failed to load record. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!config) {
      setError('Unknown document type.')
      setLoading(false)
      return
    }
    fetchRecord()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await axios.delete(`${API_URL}/api/${config.apiPath}/${id}`, { withCredentials: true })
      if (res.data.success) {
        toast.success(`${config.label || (type === 'Tax' ? 'Road Tax' : type)} record deleted`)
        navigate('/rto-documents')
      } else {
        toast.error('Failed to delete record')
      }
    } catch {
      toast.error('Failed to delete record')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEditSubmit = async (updatedData) => {
    try {
      await axios.put(`${API_URL}/api/${config.apiPath}/${id}`, updatedData, { withCredentials: true })
      toast.success('Record updated successfully')
      setShowEditModal(false)
      fetchRecord()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record')
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 font-semibold">Unknown document type.</p>
      </div>
    )
  }

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-600' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconBg: 'bg-sky-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', iconBg: 'bg-violet-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-600' },
  }

  const col = colorMap[config.color] || colorMap.blue
  const status = record?.status || 'unknown'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.unknown
  const documentUrl = record ? record[config.documentField] : null
  const fullDocUrl = documentUrl 
    ? (documentUrl.startsWith('http') || documentUrl.startsWith('data:') ? documentUrl : `${API_URL}${documentUrl}`) 
    : null

  const displayFilename = record?.documentName || (fullDocUrl && !fullDocUrl.startsWith('data:') ? fullDocUrl.split('/').pop() : null)

  const endorsementUrls = (() => {
    if (!record) return []
    const docs = record.endorsementDocuments
    if (Array.isArray(docs) && docs.length > 0) return docs
    const single = config.endorsementField ? record[config.endorsementField] : null
    return single ? [single] : []
  })()
  const fullEndorsementUrls = endorsementUrls.map(url =>
    url.startsWith('http') || url.startsWith('data:') ? url : `${API_URL}${url}`
  )

  const [endorsementImgsLoaded, setEndorsementImgsLoaded] = useState({})

  const handleDownload = async () => {
    if (!fullDocUrl) return
    try {
      const response = await fetch(fullDocUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = displayFilename || `document.${blob.type.split('/')[1] || 'pdf'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // fallback: open in new tab
      window.open(fullDocUrl, '_blank')
    }
  }

  const handleEndorsementDownload = async (url) => {
    if (!url) return
    const filename = !url.startsWith('data:') ? url.split('/').pop() : null
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || `endorsement.${blob.type.split('/')[1] || 'pdf'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 pb-24 pt-3 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Loading State */}
        {loading && (
          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
            <p className="text-sm font-semibold text-slate-400">Loading record…</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-4xl">⚠️</div>
            <h3 className="text-lg font-black text-slate-800">{error}</h3>
            <button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
              Go Back
            </button>
          </div>
        )}

        {/* Record Loaded */}
        {!loading && !error && record && (
          <div className="space-y-3">

            {/* Hero Card */}
            <div className={`rounded-xl border border-slate-200 ${col.bg} p-3 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${col.iconBg} text-white shadow text-xl`}>
                    {config.icon}
                  </div>
                  <div>
                    <h2 className={`text-base font-black leading-tight ${col.text}`}>{type === 'Tax' ? 'Road Tax' : type} Document</h2>
                    <p className="text-[11px] font-black tracking-widest text-slate-900 mt-0.5">{record.vehicleNumber}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusStyle.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>
              <div className='mt-3 flex gap-2'>
                <button
                  onClick={handleEditClick}
                  className='flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm'
                >
                  <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className='flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm'
                >
                  <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Validity Period */}
            {config.fromField && config.toField && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Validity Period</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 flex justify-between items-center">
                  <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400">From</p>
                  <p className="text-sm font-black text-slate-700">{record[config.fromField] || '—'}</p>
                </div>
                <div className={`rounded-lg ${col.bg} p-2 border ${col.border} flex justify-between items-center`}>
                  <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400">To</p>
                  <p className={`text-sm font-black ${col.text}`}>{record[config.toField] || '—'}</p>
                </div>
              </div>
            </div>
            )}

            {/* Extra Fields */}
            {config.extraFields.filter(f => record[f.key] !== undefined && record[f.key] !== null && record[f.key] !== '').length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Record Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {config.extraFields
                    .filter(f => record[f.key] !== undefined && record[f.key] !== null && record[f.key] !== '')
                    .map(({ label, key, prefix }) => {
                      const val = record[key]
                      const display = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : prefix ? `${prefix}${val}` : val
                      return (
                        <div key={key} className={`flex flex-col rounded-lg p-2 border ${
                          key === 'claimRaised'
                            ? val ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
                            : 'bg-slate-50 border-slate-100'
                        }`}>
                          <p className="text-[9px] font-semibold text-slate-400">{label}</p>
                          <p className={`text-[11px] font-black ${
                            key === 'claimRaised' ? (val ? 'text-green-700' : 'text-slate-500') : 'text-slate-800'
                          }`}>
                            {display}
                          </p>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Fee Breakup (if present) */}
            {Array.isArray(record.feeBreakup) && record.feeBreakup.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Fee Breakup</p>
                <div className="divide-y divide-slate-100">
                  {record.feeBreakup.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <p className="text-[11px] font-semibold text-slate-600">{item.name}</p>
                      <p className="text-[11px] font-black text-slate-800">₹{item.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Preview Section */}
            {type === 'RC' ? (
              <div className="space-y-3">
                {/* RC Front Image */}
                {record.rcFrontImage && (
                  <RcImageBlock url={record.rcFrontImage} label="Front Side" apiUrl={API_URL} />
                )}
                {/* RC Back Image */}
                {record.rcBackImage && (
                  <RcImageBlock url={record.rcBackImage} label="Back Side" apiUrl={API_URL} />
                )}
              </div>
            ) : fullDocUrl && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
                <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Attached Document
                    </h3>
                    <button
                      onClick={handleDownload}
                      className='flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm cursor-pointer'
                      title='Download document'
                    >
                      <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                      Download
                    </button>
                  </div>
                  {/* Filename Display */}
                  {displayFilename && (
                    <div className="bg-white rounded-md border border-slate-200 px-2.5 py-1.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      <span className="font-mono text-[10px] font-semibold text-slate-600 truncate">{displayFilename}</span>
                    </div>
                  )}
                </div>

                {!isPdf(fullDocUrl) ? (
                  <div className="relative rounded-b-xl overflow-hidden bg-slate-50 min-h-[200px] flex items-center justify-center p-2">
                    {!imgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-r-transparent" />
                      </div>
                    )}
                    <img
                      src={fullDocUrl}
                      alt="Uploaded document"
                      className={`w-full object-contain rounded-lg transition-opacity duration-300 ${imgLoaded ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                      style={{ maxHeight: '480px' }}
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgLoaded(true)}
                    />
                  </div>
                ) : (
                  <div className="relative bg-slate-50 rounded-b-xl">
                    <iframe
                      src={fullDocUrl}
                      title="Document PDF"
                      className="w-full border-none"
                      style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
                    />
                  </div>
                )}
              </div>
            )}

            {type === 'Insurance' && fullEndorsementUrls.length > 0 && fullEndorsementUrls.map((url, idx) => {
              const filename = !url.startsWith('data:') ? url.split('/').pop() : null
              return (
                <div key={idx} className="rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col mt-4">
                  <div className="bg-amber-50 p-2.5 border-b border-amber-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.414 6.586a6 6 0 108.484 8.484L20.5 13" /></svg>
                        Endorsement{fullEndorsementUrls.length > 1 ? ` #${idx + 1}` : ' Document'}
                      </h3>
                      <button
                        onClick={() => handleEndorsementDownload(url)}
                        className='flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-100 transition-all shadow-sm cursor-pointer'
                        title='Download endorsement'
                      >
                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        Download
                      </button>
                    </div>
                    {filename && (
                      <div className="bg-white rounded-md border border-amber-200 px-2.5 py-1.5 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <span className="font-mono text-[10px] font-semibold text-slate-600 truncate">{filename}</span>
                      </div>
                    )}
                  </div>
                  {!isPdf(url) ? (
                    <div className="relative rounded-b-xl overflow-hidden bg-slate-50 min-h-[200px] flex items-center justify-center p-2">
                      {!endorsementImgsLoaded[idx] && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-r-transparent" />
                        </div>
                      )}
                      <img
                        src={url}
                        alt={`Endorsement document ${idx + 1}`}
                        className={`w-full object-contain rounded-lg transition-opacity duration-300 ${endorsementImgsLoaded[idx] ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                        style={{ maxHeight: '480px' }}
                        onLoad={() => setEndorsementImgsLoaded(prev => ({ ...prev, [idx]: true }))}
                        onError={() => setEndorsementImgsLoaded(prev => ({ ...prev, [idx]: true }))}
                      />
                    </div>
                  ) : (
                    <div className="relative bg-slate-50 rounded-b-xl">
                      <iframe
                        src={url}
                        title={`Endorsement PDF ${idx + 1}`}
                        className="w-full border-none"
                        style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-800">Delete Record</h3>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete this {config.label} record for <span className="font-bold">{record?.vehicleNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && type === 'Fitness' && (
        <EditFitnessModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            fetchRecord()
          }}
          fitness={record}
        />
      )}
      {showEditModal && type === 'Tax' && (
        <EditTaxModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          tax={record}
        />
      )}
      {showEditModal && type === 'PUC' && (
        <EditPucModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          puc={record}
        />
      )}
      {showEditModal && type === 'GPS' && (
        <EditGpsModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          gps={record}
        />
      )}
      {showEditModal && type === 'Permit' && (
        <EditPermitModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          permit={record}
        />
      )}
      {showEditModal && type === 'RC' && (
        <EditRcModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          rc={record}
        />
      )}
      {showEditModal && type === 'Insurance' && (
        <AddInsuranceModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={async () => {
            setShowEditModal(false)
            fetchRecord()
          }}
          initialData={record}
          isEditMode={true}
        />
      )}
    </div>
  )
}

export default RTODocumentDetail
