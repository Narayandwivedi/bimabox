import { useState, useEffect } from 'react'

const ImportModal = ({ isOpen, onClose, onProceed }) => {
  const [dataTypes] = useState([
    { value: 'insurance', label: 'Insurance' },
    { value: 'puc', label: 'PUC' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'tax', label: 'Tax' },
    { value: 'gps', label: 'GPS' }
  ])
  const [selectedDataType, setSelectedDataType] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDataType('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity'
        onClick={onClose}
      ></div>

      <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0'>
        <div
          className='bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600'>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h2 className='text-base font-bold text-gray-900'>Upload Document</h2>
                <p className='text-[11px] text-gray-500'>Choose document and upload method</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-100 rounded-lg'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className='p-5 space-y-6'>
            {/* 1. Document Type Selection */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                1. Select Document Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {dataTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedDataType(type.value)}
                    className={`px-3 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                      selectedDataType === type.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Upload Method (only show if type is selected) */}
            {selectedDataType && (
              <div className='animate-fadeIn'>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  2. Choose Entry Method
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='relative'>
                    <input
                      type='file'
                      accept='application/pdf,image/*'
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          onProceed(selectedDataType, 'ai', file);
                        }
                      }}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                      title='AI Upload'
                    />
                    <div className='flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all border-gray-100 bg-white hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-sm hover:shadow-md'>
                      <div className='w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-emerald-100 text-emerald-600'>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span className='text-sm font-bold text-emerald-700'>AI Upload</span>
                      <span className='text-[10px] text-gray-500 mt-1 text-center'>Auto-extract details</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onProceed(selectedDataType, 'manual', null)}
                    className='flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer shadow-sm hover:shadow-md'
                  >
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-blue-100 text-blue-600'>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <span className='text-sm font-bold text-blue-700'>Enter Manually</span>
                    <span className='text-[10px] text-gray-500 mt-1 text-center'>Type details yourself</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-5 pt-0 mt-2 flex gap-3'>
            <button
              onClick={onClose}
              className='w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ImportModal


