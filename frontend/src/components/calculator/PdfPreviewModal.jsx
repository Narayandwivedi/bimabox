import { useState, useRef } from 'react'

const PdfPreviewModal = ({ isOpen, onClose, pdfUrl, quoteId, API_URL }) => {
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef(null)

  if (!isOpen) return null

  const fullPdfUrl = `${API_URL}${pdfUrl}`

  const handleDownload = async () => {
    try {
      const response = await fetch(fullPdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${quoteId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback
      window.open(fullPdfUrl, '_blank')
    }
  }

  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow.print()
      } catch (e) {
        // Fallback for cross-origin or restricted environment
        const printWindow = window.open(fullPdfUrl, '_blank')
        if (printWindow) {
          printWindow.print()
        }
      }
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullPdfUrl)
    alert('Quotation link copied to clipboard!')
  }

  const handleWhatsAppShare = () => {
    const msg = `🏷️ *INSURANCE QUOTATION - BIMABOX*\n\nQuote ID: *${quoteId}*\nView/Download PDF: ${fullPdfUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200'>
      <div className='relative flex flex-col w-full max-w-5xl h-[90vh] rounded-[24px] sm:rounded-[32px] bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300'>
        
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse' />
              <h3 className='text-base font-black text-slate-800 tracking-tight'>Quotation Preview</h3>
            </div>
            <p className='text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest'>{quoteId}</p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2'>
            <button
              onClick={handleDownload}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-200 transition-all active:scale-95'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
              </svg>
              Download
            </button>

            <button
              onClick={handlePrint}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all active:scale-95'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
              </svg>
              Print
            </button>

            <button
              onClick={handleWhatsAppShare}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95'
            >
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
              </svg>
              Share
            </button>

            <button
              onClick={handleCopyLink}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all active:scale-95'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' />
              </svg>
              Link
            </button>

            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Iframe Viewer */}
        <div className='relative flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden'>
          {loading && (
            <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-4 z-10'>
              <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600' />
              <p className='text-xs sm:text-sm font-bold text-slate-500'>Loading PDF Preview...</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={`${fullPdfUrl}#toolbar=0&navpanes=0`}
            className='w-full h-full rounded-2xl border border-slate-200 bg-white shadow-inner shadow-slate-100'
            onLoad={() => setLoading(false)}
            title={`Quotation PDF: ${quoteId}`}
          />
        </div>

        {/* Footer info */}
        <div className='px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-medium'>
          Use browser controls inside the PDF preview window to zoom or rotate. If preview is blank, please click Download to view.
        </div>
      </div>
    </div>
  )
}

export default PdfPreviewModal
