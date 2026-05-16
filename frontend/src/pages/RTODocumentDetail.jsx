import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

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

  const config = TYPE_CONFIG[type]

  useEffect(() => {
    if (!config) {
      setError('Unknown document type.')
      setLoading(false)
      return
    }

    const fetchRecord = async () => {
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

    fetchRecord()
  }, [type, id, config])

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

        {/* Back Button + Header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{type} Document</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Record Details</p>
          </div>
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
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Uploaded Document</p>

              {!fullDocUrl ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 py-10 gap-3">
                  <span className="text-4xl grayscale opacity-40">📄</span>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No document uploaded</p>
                </div>
              ) : isPdf(fullDocUrl) ? (
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
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
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
              )}
            </div>


          </div>
        )}
      </div>
    </div>
  )
}

export default RTODocumentDetail
