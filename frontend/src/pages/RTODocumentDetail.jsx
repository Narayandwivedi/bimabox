import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import EditFitnessModal from './Fitness/components/EditFitnessModal'
import EditPucModal from './Puc/components/EditPucModal'
import EditGpsModal from './Gps/components/EditGpsModal'
import EditTaxModal from './Tax/components/EditTaxModal'

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
      { label: 'Receipt No.', key: 'receiptNo' },
      { label: 'Owner Name', key: 'ownerName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
      { label: 'Tax Amount', key: 'taxAmount', prefix: '₹' },
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
    icon: '🛡️',
    color: 'blue',
    fromField: 'validFrom',
    toField: 'validTo',
    extraFields: [
      { label: 'Policy Number', key: 'policyNumber' },
      { label: 'Policy Holder', key: 'policyHolderName' },
      { label: 'Mobile Number', key: 'mobileNumber' },
      { label: 'Issue Date', key: 'issueDate' },
      { label: 'Remarks', key: 'remarks' },
    ],
  },
}

const STATUS_STYLES = {
  active: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
  expiring_soon: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Expiring Soon' },
  expired: { badge: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Expired' },
  unknown: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Unknown' },
}

const isPdf = (url) => url && url.toLowerCase().includes('.pdf')

// --- Component ---
const RTODocumentDetail = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfError, setPdfError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [previewTab, setPreviewTab] = useState('image') // 'image' | 'pdf'
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const config = TYPE_CONFIG[type]

  const fetchRecord = async () => {
    if (!config) return
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/${config.apiPath}/id/${id}`, { withCredentials: true })
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
      const res = await axios.delete(`${API_URL}/api/${config.apiPath}/id/${id}`, { withCredentials: true })
      if (res.data.success) {
        toast.success(`${config.label || type} record deleted`)
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
      await axios.put(`${API_URL}/api/${config.apiPath}/id/${id}`, updatedData, { withCredentials: true })
      toast.success('Record updated successfully')
      setShowEditModal(false)
      fetchRecord()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record')
    }
  }

  const handleEditClick = () => {
    if (type === 'Insurance') {
      navigate('/insurance') // No edit modal exists for insurance
      toast.info('Please edit this record from the Insurance module')
    } else {
      setShowEditModal(true)
    }
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
  }

  const col = colorMap[config.color] || colorMap.blue
  const status = record?.status || 'unknown'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.unknown
  const documentUrl = record ? record[config.documentField] : null
  const fullDocUrl = documentUrl ? (documentUrl.startsWith('http') ? documentUrl : `${API_URL}${documentUrl}`) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white px-4 pb-32 pt-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">

          {/* Header Action / Breadcrumb */}
          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 md:px-6 mb-5 rounded-xl border border-slate-200">
            <button
              onClick={() => navigate('/rto-documents')}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Documents
            </button>
          </div>

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
          <div className="space-y-4">

            {/* Hero Card */}
            <div className={`rounded-2xl border-2 ${col.border} ${col.bg} p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${col.iconBg} text-white shadow-lg text-2xl`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Type</p>
                    <h2 className={`text-lg font-black ${col.text}`}>{type}</h2>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusStyle.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-white/60">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Vehicle Number</p>
                <p className="text-2xl font-black tracking-widest text-slate-900">{record.vehicleNumber}</p>
              </div>
            </div>

            {/* Validity Period */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Validity Period</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400 mb-1">Valid From</p>
                  <p className="text-base font-black text-slate-700">{record[config.fromField] || '—'}</p>
                </div>
                <div className={`rounded-xl ${col.bg} p-3 border ${col.border}`}>
                  <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400 mb-1">Valid To</p>
                  <p className={`text-base font-black ${col.text}`}>{record[config.toField] || '—'}</p>
                </div>
              </div>
            </div>

            {/* Extra Fields */}
            {config.extraFields.filter(f => record[f.key] !== undefined && record[f.key] !== null && record[f.key] !== '').length > 0 && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Record Details</p>
                <div className="divide-y divide-slate-50">
                  {config.extraFields
                    .filter(f => record[f.key] !== undefined && record[f.key] !== null && record[f.key] !== '')
                    .map(({ label, key, prefix }) => (
                      <div key={key} className="flex items-center justify-between py-2.5">
                        <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                        <p className="text-[12px] font-bold text-slate-900">
                          {prefix ? `${prefix}${record[key]}` : record[key]}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Fee Breakup (if present) */}
            {Array.isArray(record.feeBreakup) && record.feeBreakup.length > 0 && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fee Breakup</p>
                <div className="divide-y divide-slate-50">
                  {record.feeBreakup.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <p className="text-[11px] font-semibold text-slate-500">{item.name}</p>
                      <p className="text-[12px] font-bold text-slate-900">₹{item.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Viewer */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
              {/* Header + Tabs */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Uploaded Document</p>
                  {record.documentName && (
                    <p className="text-[11px] font-bold text-slate-700 truncate mt-0.5 font-mono">{record.documentName}</p>
                  )}
                </div>
                {fullDocUrl && (
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 shrink-0">
                    <button
                      onClick={() => setPreviewTab('image')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        previewTab === 'image' ? `${col.iconBg} text-white shadow-sm` : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      🖼️ Image
                    </button>
                    <button
                      onClick={() => setPreviewTab('pdf')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        previewTab === 'pdf' ? `${col.iconBg} text-white shadow-sm` : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      📄 PDF
                    </button>
                  </div>
                )}
              </div>

              {!fullDocUrl ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 py-10 gap-3">
                  <span className="text-4xl grayscale opacity-40">📄</span>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No document uploaded</p>
                </div>
              ) : previewTab === 'image' ? (
                /* ── Image Preview ── */
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
                    </div>
                  )}
                  <img
                    src={fullDocUrl}
                    alt="Uploaded document"
                    className={`w-full object-contain rounded-xl transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ maxHeight: '480px' }}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgLoaded(true)}
                  />
                  <a
                    href={fullDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-lg ${col.iconBg} px-3 py-1.5 text-[10px] font-bold text-white shadow-md`}
                  >
                    Full Size ↗
                  </a>
                </div>
              ) : (
                /* ── PDF Preview ── */
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {pdfError ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 bg-slate-50">
                      <span className="text-4xl">📄</span>
                      <p className="text-xs font-semibold text-slate-500">Cannot preview PDF inline.</p>
                      <a
                        href={fullDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-xl ${col.iconBg} px-5 py-2.5 text-xs font-bold text-white shadow-md`}
                      >
                        Open PDF ↗
                      </a>
                    </div>
                  ) : (
                    <div className="relative">
                      <iframe
                        src={fullDocUrl}
                        title="Document PDF"
                        className="w-full rounded-xl"
                        style={{ height: '480px', border: 'none' }}
                        onError={() => setPdfError(true)}
                      />
                      <a
                        href={fullDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-lg ${col.iconBg} px-3 py-1.5 text-[10px] font-bold text-white shadow-md`}
                      >
                        Open ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>


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
    </div>
  )
}

export default RTODocumentDetail
