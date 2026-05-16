import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import DocumentMockup from '../components/DocumentMockup'

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

const DocumentDetail = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/${type}/id/${id}`, { withCredentials: true })
        if (response.data.success) {
          const record = response.data.data
          
          let normalizedDoc = { ...record }
          normalizedDoc.type = type.toUpperCase()
          
          normalizedDoc.validFrom = record.validFrom || record.taxFrom || 'N/A'
          normalizedDoc.validTo = record.validTo || record.taxTo || 'N/A'
          normalizedDoc.issuer = record.issuer || record.insuranceCompany || 'N/A'
          normalizedDoc.ownerName = record.ownerName || record.policyHolderName || 'N/A'
          
          const fileField = Object.keys(record).find(k => k.toLowerCase().includes('document') && typeof record[k] === 'string' && record[k].startsWith('data:'))
          if (fileField) {
            normalizedDoc.fileData = record[fileField]
          }

          setDoc(normalizedDoc)
        } else {
          setError('Document not found')
        }
      } catch (err) {
        console.error('Error fetching document:', err)
        setError('Failed to fetch document')
      } finally {
        setLoading(false)
      }
    }

    if (type && id) {
      fetchDocument()
    }
  }, [type, id])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${doc.type} - ${doc.vehicleNumber}`,
          text: `Official ${doc.type} document for vehicle ${doc.vehicleNumber}.`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-100'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent' />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-slate-100'>
        <div className='mb-4 text-4xl'>⚠️</div>
        <h2 className='text-xl font-bold text-slate-800'>{error || 'Document not found'}</h2>
        <button onClick={() => navigate(-1)} className='mt-6 rounded-lg bg-indigo-600 px-6 py-2 text-white font-bold hover:bg-indigo-700'>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-100 px-4 pb-32 pt-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-xl'>
        {/* Navigation Header */}
        <div className='mb-6 flex items-center justify-between'>
          <button
            onClick={() => navigate(-1)}
            className='flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm transition-all active:scale-95'
          >
            <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 19l-7-7 7-7' />
            </svg>
          </button>
          <div className='text-center'>
            <h1 className='text-lg font-black text-slate-900'>{doc.type} Detail</h1>
            <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{doc.vehicleNumber}</p>
          </div>
          <div className='w-10' /> {/* Spacer */}
        </div>

        {/* Document Display Section */}
        <div className='relative mb-8'>
          <DocumentMockup 
            type={doc.type} 
            vehicleNumber={doc.vehicleNumber} 
            chassisNumber={doc.chassisNumber}
            policyNumber={doc.policyNumber || doc.receiptNo}
            ownerName={doc.ownerName}
            validFrom={doc.validFrom}
            validTo={doc.validTo}
          />
          
          {/* Quick Actions Bar - Floating near the document */}
          <div className='absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-3'>
            <button
              onClick={handleShare}
              className='flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all active:scale-95'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
              </svg>
              Share
            </button>
            <a 
              href={doc.fileData || '#'} 
              download={doc.fileData ? `${doc.type}_${doc.vehicleNumber}` : undefined}
              className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-xl shadow-slate-200 transition-all active:scale-95 border border-slate-100'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
              </svg>
            </a>
          </div>
        </div>

        {/* Uploaded File Preview */}
        {doc.fileData && (
          <div className='mt-12'>
            <h2 className='mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>Original Document</h2>
            <div className='overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm'>
              {doc.fileData.startsWith('data:application/pdf') ? (
                <iframe
                  src={doc.fileData}
                  className='h-[600px] w-full rounded-[20px] border-0 bg-slate-50'
                  title='Document Preview'
                />
              ) : (
                <img
                  src={doc.fileData}
                  alt='Document Preview'
                  className='w-full rounded-[20px] object-contain'
                />
              )}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className='mt-8 space-y-4'>
           <div className='rounded-[28px] bg-white p-6 shadow-sm border border-slate-100'>
              <h2 className='mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>Extracted Metadata</h2>
              <div className='grid grid-cols-2 gap-4'>
                {doc.validFrom && doc.validFrom !== 'N/A' && (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Valid From</p>
                    <p className='text-xs font-black text-slate-800'>{doc.validFrom}</p>
                  </div>
                )}
                {doc.validTo && doc.validTo !== 'N/A' && (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Valid To</p>
                    <p className='text-xs font-black text-slate-800'>{doc.validTo}</p>
                  </div>
                )}
                {(doc.policyNumber || doc.receiptNo) && (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Document No</p>
                    <p className='text-xs font-black text-slate-800'>{doc.policyNumber || doc.receiptNo}</p>
                  </div>
                )}
                {doc.issuer && doc.issuer !== 'N/A' && (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Issuer</p>
                    <p className='text-xs font-black text-slate-800'>{doc.issuer}</p>
                  </div>
                )}
                {doc.ownerName && doc.ownerName !== 'N/A' && (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Owner</p>
                    <p className='text-xs font-black text-slate-800'>{doc.ownerName}</p>
                  </div>
                )}
                {(doc.totalFee || doc.totalAmount) ? (
                  <div className='space-y-1'>
                    <p className='text-[9px] font-bold uppercase text-slate-400'>Total Amount</p>
                    <p className='text-xs font-black text-slate-800'>₹{doc.totalFee || doc.totalAmount || 0}</p>
                  </div>
                ) : null}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetail
