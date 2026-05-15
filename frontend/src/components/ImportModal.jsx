import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const ImportModal = ({ isOpen, onClose }) => {
  const [dataTypes] = useState([
    { value: 'driving-license', label: 'Driving License' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'tax', label: 'Tax Records' },
    { value: 'fitness', label: 'Fitness Certificates' },
    { value: 'permit', label: 'Permit' },
    { value: 'vehicle', label: 'Vehicles' }
  ])
  const [selectedDataType, setSelectedDataType] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDataType('')
      setSelectedFile(null)
    }
  }, [isOpen])

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const isPdf = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')
      
      if (!isPdf && !isImage) {
        toast.error('Only PDF and image files are allowed', {
          position: 'top-right',
          autoClose: 3000
        })
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      toast.success('File selected successfully', {
        position: 'top-right',
        autoClose: 2000
      })
    }
  }

  const handleImport = async () => {
    if (!selectedDataType) {
      toast.error('Please select a document type', {
        position: 'top-right',
        autoClose: 3000
      })
      return
    }

    if (!selectedFile) {
      toast.error('Please upload a document', {
        position: 'top-right',
        autoClose: 3000
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('dataType', selectedDataType)
      formData.append('file', selectedFile)

      const response = await axios.post(`${API_URL}/api/import`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const result = response.data

      if (result.success) {
        toast.success(`✅ ${result.message || 'Document uploaded successfully'}`, {
          position: 'top-right',
          autoClose: 4000
        })
        
        setSelectedDataType('')
        setSelectedFile(null)
        onClose()
      } else {
        toast.error(result.message || 'Upload failed', {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity'
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0'>
        <div
          className='bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto'
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
                <p className='text-[11px] text-gray-500'>Upload PDF or Image</p>
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
          <div className='p-5 space-y-4'>
            {/* Document Type Selection */}
            <div>
              <label className='block text-xs font-bold text-gray-700 mb-1.5'>
                Document Type
              </label>
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white text-sm font-medium text-gray-800 outline-none'
              >
                <option value=''>Choose type...</option>
                {dataTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className='block text-xs font-bold text-gray-700 mb-1.5'>
                Upload File
              </label>
              <div className='relative'>
                <input
                  type='file'
                  accept='application/pdf,image/*'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                />
                <div className={`w-full px-4 py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all bg-gray-50 ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                  {selectedFile ? (
                    <>
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className='text-sm font-bold text-green-700 text-center truncate max-w-[200px]'>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Ready to upload
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white text-gray-400 shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className='text-sm font-semibold text-gray-700'>
                        Click or drag file here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF or Images only
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='p-5 pt-0 mt-2 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedDataType || !selectedFile || loading}
              className='flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  Uploading
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ImportModal

