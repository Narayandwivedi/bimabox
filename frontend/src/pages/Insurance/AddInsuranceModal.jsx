import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getTodayDate as utilGetTodayDate, handleSmartDateInput, normalizeAIExtractedDate } from '../../utils/dateFormatter'
import DocumentScannerPreview from '../../components/DocumentScannerPreview'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const INSURANCE_COMPANIES = [
  'HDFC ERGO',
  'ICICI Lombard',
  'Bajaj Allianz',
  'Tata AIG',
  'Reliance General',
  'IFFCO Tokio',
  'National Insurance',
  'New India Assurance',
  'Oriental Insurance',
  'United India Insurance',
  'Magma HDI',
  'Go Digit',
  'Acko',
  'Cholamandalam MS',
  'Future Generali',
  'Royal Sundaram',
  'SBI General',
  'Shriram General',
  'Liberty General',
  'Universal Sompo',
  'Kotak General',
  'Zuno General',
  'Raheja QBE',
  'Navi General',
  'Star Health'
]


const resolveStoredDocumentPreview = (documentPath) => {
  if (!documentPath) return null
  if (documentPath.startsWith('data:')) return documentPath
  if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) return documentPath
  return `${API_URL}${documentPath}`
}

const normalizeInsuranceCompany = (companyName) => {
  if (!companyName) return ''
  const cleaned = companyName.trim().replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
  const match = INSURANCE_COMPANIES.find(c => {
    const cCleaned = c.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
    return cleaned.includes(cCleaned) || cCleaned.includes(cleaned)
  })
  return match || ''
}

const AddInsuranceModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditMode = false, prefilledVehicleNumber = '', prefilledOwnerName = '', initialExtractionFile = null }) => {
  const isOcrUpdate = useRef(false)
  const processedInitialFile = useRef(false)
  const userEditedValidTo = useRef(false)
  const getTodayDate = () => utilGetTodayDate()
  const [formData, setFormData] = useState({
    vehicleNumber: prefilledVehicleNumber,
    policyNumber: '',
    policyHolderName: prefilledOwnerName,
    validFrom: '',
    validTo: '',
    premium: '',
    insuranceDocument: '',
    insuranceCompany: '',
    insuranceClass: '',
    product: '',
    vehicleClass: '',
    remarks: '',
    reference: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scanningFile, setScanningFile] = useState(null)
  const [isExtractingInsurance, setIsExtractingInsurance] = useState(false)
  const [uploadedInsuranceDocument, setUploadedInsuranceDocument] = useState(null)
  const [uploadedInsuranceFile, setUploadedInsuranceFile] = useState(null)
  const [references, setReferences] = useState([])
  const [referenceDropdownOpen, setReferenceDropdownOpen] = useState(false)
  const [referenceSearch, setReferenceSearch] = useState('')
  const [showAddReference, setShowAddReference] = useState(false)
  const [newReferenceName, setNewReferenceName] = useState('')

  useEffect(() => {
    return () => {
      if (uploadedInsuranceDocument?.revokeOnCleanup && uploadedInsuranceDocument.previewUrl) {
        URL.revokeObjectURL(uploadedInsuranceDocument.previewUrl)
      }
    }
  }, [uploadedInsuranceDocument])

  useEffect(() => {
    if (initialData && isOpen) {
      const vehicleNum = initialData.vehicleNumber || ''
      setFormData({
        vehicleNumber: vehicleNum,
        policyNumber: initialData.policyNumber || '',
        policyHolderName: initialData.policyHolderName || '',
        validFrom: initialData.validFrom || '',
        validTo: initialData.validTo || '',
        premium: initialData.premium != null ? String(initialData.premium) : '',
        insuranceDocument: initialData.insuranceDocument || '',
        insuranceCompany: initialData.insuranceCompany || '',
        insuranceClass: initialData.insuranceClass || '',
        product: initialData.product || '',
        vehicleClass: initialData.vehicleClass || '',
        remarks: initialData.remarks || '',
        reference: initialData.reference || ''
      })
      setUploadedInsuranceDocument(
        initialData.insuranceDocument
          ? {
              name: 'insurance-document',
              type: initialData.insuranceDocument.startsWith('data:application/pdf') || initialData.insuranceDocument.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
              previewUrl: resolveStoredDocumentPreview(initialData.insuranceDocument),
              revokeOnCleanup: false
            }
          : null
      )
      setUploadedInsuranceFile(null)
      userEditedValidTo.current = true
    } else if (!isOpen) {
      setFormData({
        vehicleNumber: prefilledVehicleNumber,
        policyNumber: '',
        policyHolderName: prefilledOwnerName,
        validFrom: '',
        validTo: '',
        premium: '',
        insuranceDocument: '',
        insuranceCompany: '',
        insuranceClass: '',
        product: '',
        vehicleClass: '',
        remarks: '',
        reference: ''
      })
      setScanningFile(null)
      setIsExtractingInsurance(false)
      setUploadedInsuranceDocument(prev => {
        if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
      setUploadedInsuranceFile(null)
      processedInitialFile.current = false
      userEditedValidTo.current = false
    }
  }, [initialData, isOpen, prefilledVehicleNumber, prefilledOwnerName])

  useEffect(() => {
    if (isOpen) {
      const fetchReferences = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/references`, { withCredentials: true })
          if (res.data.success) setReferences(res.data.data)
        } catch { }
      }
      fetchReferences()
    }
  }, [isOpen])

  const handleReferenceSelect = (name) => {
    setFormData(prev => ({ ...prev, reference: name }))
    setReferenceDropdownOpen(false)
    setReferenceSearch('')
  }

  const handleAddReference = async () => {
    const name = newReferenceName.trim()
    if (!name) return
    try {
      const res = await axios.post(`${API_URL}/api/references`, { name }, { withCredentials: true })
      if (res.data.success) {
        setReferences(prev => {
          const exists = prev.find(r => r.name === name)
          return exists ? prev : [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name))
        })
        setFormData(prev => ({ ...prev, reference: name }))
        setNewReferenceName('')
        setShowAddReference(false)
        setReferenceDropdownOpen(false)
      }
    } catch { }
  }

  const filteredReferences = references.filter(r =>
    !referenceSearch || r.name.toLowerCase().includes(referenceSearch.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && initialExtractionFile && !processedInitialFile.current) {
      processedInitialFile.current = true
      if (initialExtractionFile.type === 'application/pdf') {
        setUploadedInsuranceFile(initialExtractionFile)
        processExtraction(initialExtractionFile)
      } else if (initialExtractionFile.type.startsWith('image/')) {
        setUploadedInsuranceFile(initialExtractionFile)
        setScanningFile(initialExtractionFile)
      }
    }
  }, [isOpen, initialExtractionFile])

  useEffect(() => {
    if (isOpen && !initialData && (prefilledVehicleNumber || prefilledOwnerName)) {
      setFormData(prev => ({ ...prev, vehicleNumber: prefilledVehicleNumber, policyHolderName: prefilledOwnerName }))
    }
  }, [isOpen, prefilledVehicleNumber, prefilledOwnerName, initialData])

  useEffect(() => {
    if (isOcrUpdate.current || userEditedValidTo.current || !formData.validFrom) return
    const parts = formData.validFrom.trim().split(/[/-]/)
    if (parts.length !== 3) return
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    if ([day, month, year].some(Number.isNaN) || year <= 1900) return
    const validFromDate = new Date(year, month, day)
    if (Number.isNaN(validFromDate.getTime())) return
    if (validFromDate.getDate() !== day || validFromDate.getMonth() !== month || validFromDate.getFullYear() !== year) return
    const validToDate = new Date(validFromDate)
    validToDate.setFullYear(validToDate.getFullYear() + 1)
    validToDate.setDate(validToDate.getDate() - 1)
    const newDay = String(validToDate.getDate()).padStart(2, '0')
    const newMonth = String(validToDate.getMonth() + 1).padStart(2, '0')
    const newYear = validToDate.getFullYear()
    const formattedValidTo = `${newDay}-${newMonth}-${newYear}`
    if (formData.validTo !== formattedValidTo) {
      setFormData(prev => ({ ...prev, validTo: formattedValidTo }))
    }
  }, [formData.validFrom, formData.validTo])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'vehicleNumber') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
      return
    }
    if (name === 'policyNumber') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
      return
    }
    if (name === 'validFrom' || name === 'validTo') {
      if (name === 'validTo') userEditedValidTo.current = true
      const formatted = handleSmartDateInput(value, formData[name] || '')
      if (formatted !== null) setFormData(prev => ({ ...prev, [name]: formatted }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const processExtraction = async (fileToProcess) => {
    setIsExtractingInsurance(true)
    const updateToast = toast.info('Analyzing insurance document, please wait...', { autoClose: false, isLoading: true })

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const response = await axios.post(`${API_URL}/api/ocr/insurance`, { imageBase64: reader.result }, { withCredentials: true })
          if (response.data.success && response.data.data) {
            const resultData = response.data.data
            isOcrUpdate.current = true

            setFormData(prev => {
              const updated = { ...prev }
              Object.keys(resultData).forEach((key) => {
                const value = resultData[key]
                if (!value || !Object.prototype.hasOwnProperty.call(updated, key)) return
                if (key === 'validFrom' || key === 'validTo') {
                  const normalizedStr = normalizeAIExtractedDate(value)
                  const formatted = handleSmartDateInput(normalizedStr, '')
                  if (formatted) updated[key] = formatted
                  return
                }
                if (key === 'vehicleNumber') {
                  updated[key] = value.toUpperCase().replace(/\s+/g, '')
                  return
                }
                if (key === 'policyNumber') {
                  updated[key] = value.toUpperCase()
                  return
                }
                if (key === 'insuranceCompany') {
                  updated[key] = normalizeInsuranceCompany(value)
                  return
                }
                if (key === 'premium') {
                  updated[key] = String(value).replace(/[^0-9.]/g, '')
                  return
                }
                updated[key] = value
              })

              return updated
            })

            setTimeout(() => { isOcrUpdate.current = false }, 200)
            setUploadedInsuranceDocument(prev => {
              if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
              return {
                name: fileToProcess.name || 'insurance-document',
                type: fileToProcess.type === 'application/pdf' ? 'pdf' : 'image',
                previewUrl: URL.createObjectURL(fileToProcess),
                revokeOnCleanup: true
              }
            })
            toast.dismiss(updateToast)
            toast.success('Insurance details extracted successfully!', { position: 'top-right', autoClose: 3000 })
          } else {
            toast.dismiss(updateToast)
            toast.error('Failed to extract data correctly.', { position: 'top-right', autoClose: 3000 })
          }
        } catch (error) {
          console.error(error)
          toast.dismiss(updateToast)
          toast.error('Server error during OCR processing.', { position: 'top-right', autoClose: 3000 })
        } finally {
          setIsExtractingInsurance(false)
        }
      }
      reader.readAsDataURL(fileToProcess)
    } catch (error) {
      console.error(error)
      toast.dismiss(updateToast)
      toast.error('Error reading the file.', { position: 'top-right', autoClose: 3000 })
      setIsExtractingInsurance(false)
    }
  }

  const handleManualDocumentUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB.', { position: 'top-right', autoClose: 3000 })
      e.target.value = ''
      return
    }

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setUploadedInsuranceFile(file)
      setUploadedInsuranceDocument(prev => {
        if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return {
          name: file.name || 'insurance-document',
          type: file.type === 'application/pdf' ? 'pdf' : 'image',
          previewUrl: URL.createObjectURL(file),
          revokeOnCleanup: true
        }
      })
      toast.success('Document attached successfully!', { position: 'top-right', autoClose: 2000 })
      e.target.value = ''
      return
    }
    toast.error('Please upload an image or PDF file.', { position: 'top-right', autoClose: 3000 })
  }

  const handleScannerConfirm = async (processedImageFile) => {
    setScanningFile(null)
    setUploadedInsuranceFile(processedImageFile)
    await processExtraction(processedImageFile)
  }

  const handleInputKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const currentTabIndex = parseInt(e.target.getAttribute('tabIndex'), 10)
    if (currentTabIndex === 5) {
      document.querySelector('form')?.requestSubmit()
      return
    }
    const nextInput = document.querySelector(`input[tabIndex="${currentTabIndex + 1}"]`)
    if (nextInput) nextInput.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    let uploadedDocumentPath = formData.insuranceDocument;

    if (uploadedInsuranceFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('document', uploadedInsuranceFile);
      try {
        const uploadResponse = await axios.post(`${API_URL}/api/upload/document`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        if (uploadResponse.data.success) {
           uploadedDocumentPath = uploadResponse.data.data.path;
        } else {
           toast.error('Failed to upload document to server');
           setIsSubmitting(false);
           return;
        }
      } catch (err) {
         console.error('Upload Error Detailed:', err);
         if (err.response) {
            console.error('Error Response Data:', err.response.data);
            console.error('Error Response Status:', err.response.status);
            console.error('Error Response Headers:', err.response.headers);
         } else if (err.request) {
            console.error('Error Request:', err.request);
         } else {
            console.error('Error Message:', err.message);
         }
         toast.error(err.response?.data?.message || `Failed to upload document: ${err.message}. Ensure it is not larger than 15MB.`);
         setIsSubmitting(false);
         return;
      }
    }

    const submitData = {
      vehicleNumber: formData.vehicleNumber,
      policyNumber: formData.policyNumber,
      policyHolderName: formData.policyHolderName,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      premium: formData.premium !== '' ? Number(formData.premium) : 0,
      issueDate: formData.validFrom,
      insuranceDocument: uploadedDocumentPath,
      insuranceCompany: formData.insuranceCompany,
      insuranceClass: formData.insuranceClass,
      product: formData.product,
      vehicleClass: formData.vehicleClass,
      remarks: formData.remarks,
      reference: formData.reference
    }

    try {
      const request = isEditMode && initialData?._id
        ? axios.put(`${API_URL}/api/insurance/${initialData._id}`, submitData, { withCredentials: true })
        : axios.post(`${API_URL}/api/insurance`, submitData, { withCredentials: true })
      const response = await request
      if (response.data.success) {
        toast.success(isEditMode ? 'Insurance updated successfully!' : 'Insurance added successfully!')
        if (onSubmit) await onSubmit()
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save insurance')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] md:max-h-[95vh] overflow-hidden flex flex-col'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>{isEditMode ? 'Edit Insurance' : 'Add New Insurance'}</h2>
              <p className='text-blue-100 text-xs md:text-sm mt-1'>{isEditMode ? 'Update insurance record' : 'Add insurance record'}</p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='relative overflow-hidden'>
                <button type='button' className='relative px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 max-w-full'>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Document
                </button>
                <input type='file' accept='image/*, application/pdf' onChange={handleManualDocumentUpload} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
              </div>
              <button onClick={onClose} className='text-white hover:bg-white/20 rounded-lg p-1.5 md:p-2 transition cursor-pointer'>
                <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-3 md:p-6'>


            <div className='bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Policy Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Vehicle Number</label>
                  <div className='relative'>
                    <input type='text' name='vehicleNumber' value={formData.vehicleNumber} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='Enter vehicle number' tabIndex='1' className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono bg-white' autoFocus />
                  </div>
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Policy Number</label>
                  <input type='text' name='policyNumber' value={formData.policyNumber} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='INS001234567' tabIndex='2' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono bg-white' />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Policy Holder Name</label>
                  <input type='text' name='policyHolderName' value={formData.policyHolderName} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='Enter policy holder name' tabIndex='3' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white' />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Insurance Company</label>
                  <select name='insuranceCompany' value={formData.insuranceCompany} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'>
                    <option value="">Select Company</option>
                    {INSURANCE_COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Product Type</label>
                  <select name='product' value={formData.product} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'>
                    <option value="">Select Product Type</option>
                    <option value="GCV">GCV</option>
                    <option value="GCV-3W">GCV-3W</option>
                    <option value="Pvt. Car">Pvt. Car</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Two Wheeler">Two Wheeler</option>
                    <option value="Mis-D">Mis-D</option>
                    <option value="PCV">PCV</option>
                    <option value="PCV-3W">PCV-3W</option>
                    <option value="Health">Health</option>
                    <option value="Life">Life</option>
                    <option value="Fire">Fire</option>
                    <option value="Burglary">Burglary</option>
                    <option value="WC">WC</option>
                    <option value="CPM">CPM</option>
                    <option value="Travel">Travel</option>
                    <option value="Marine">Marine</option>
                    <option value="GPA">GPA</option>
                    <option value="GMC">GMC</option>
                  </select>
                </div>



                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Policy Type</label>
                  <select name='insuranceClass' value={formData.insuranceClass} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'>
                    <option value="">Select Policy Type</option>
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Third Party">Third Party</option>
                  </select>
                </div>

                <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  <div className='relative'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700'>Reference</label>
                      <button
                        type='button'
                        onClick={() => { setShowAddReference(true); setNewReferenceName('') }}
                        className='text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center cursor-pointer'
                      >
                        <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                        Add
                      </button>
                    </div>
                    <div className='relative'>
                      <input
                        type='text'
                        value={referenceDropdownOpen ? referenceSearch : formData.reference}
                        onFocus={() => { setReferenceSearch(''); setReferenceDropdownOpen(true) }}
                        onChange={(e) => { setReferenceSearch(e.target.value); setReferenceDropdownOpen(true) }}
                        onBlur={() => setTimeout(() => setReferenceDropdownOpen(false), 200)}
                        placeholder='Select or type reference...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white pr-10'
                      />
                      {formData.reference && !referenceDropdownOpen ? (
                        <button
                          type='button'
                          onClick={() => setFormData(prev => ({ ...prev, reference: '' }))}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer'
                          title='Clear reference'
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type='button'
                          onClick={() => setReferenceDropdownOpen(prev => !prev)}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        </button>
                      )}
                    </div>
                    {referenceDropdownOpen && (
                      <div className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                        {filteredReferences.length > 0 ? (
                          filteredReferences.map((ref) => (
                            <button
                              key={ref._id}
                              type='button'
                              onMouseDown={() => handleReferenceSelect(ref.name)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition cursor-pointer ${formData.reference === ref.name ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'}`}
                            >
                              {ref.name}
                            </button>
                          ))
                        ) : (
                          <div className='px-3 py-2 text-sm text-gray-400'>
                            {referenceSearch ? 'No matching reference found' : 'No references yet'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Notes</label>
                    <textarea name='remarks' value={formData.remarks} onChange={handleChange} rows='2' placeholder='Any additional notes...' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none' />
                  </div>
                </div>

              </div>
            </div>

            <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Validity & Premium
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Valid From <span className='text-red-500'>*</span></label>
                  <input type='text' name='validFrom' value={formData.validFrom} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder={getTodayDate()} tabIndex='4' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white' required />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Valid To <span className='text-xs text-blue-500'>(Auto-calculated, editable)</span></label>
                  <input type='text' name='validTo' value={formData.validTo} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='DD-MM-YYYY' tabIndex='5' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white' />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Premium (₹)
                    <span className='ml-1 text-xs text-purple-500 font-normal'>Annual amount</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm'>₹</span>
                    <input
                      type='number'
                      name='premium'
                      value={formData.premium}
                      onChange={handleChange}
                      placeholder='0'
                      min='0'
                      step='any'
                      tabIndex='6'
                      className='w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white'
                    />
                  </div>
                </div>
              </div>
            </div>

            {uploadedInsuranceDocument && (
              <div className='bg-gradient-to-r from-slate-50 to-violet-50 border-2 border-slate-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
                <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                  <span className='bg-slate-700 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                  Uploaded Insurance Document
                </h3>
                <div className='mb-3 flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2 border border-slate-200'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-800 truncate'>{uploadedInsuranceDocument.name}</p>
                    <p className='text-xs text-slate-500'>{uploadedInsuranceDocument.type === 'pdf' ? 'PDF preview' : 'Image preview'}</p>
                  </div>
                </div>
                {uploadedInsuranceDocument.type === 'pdf' ? (
                  <iframe src={uploadedInsuranceDocument.previewUrl} title='Uploaded Insurance PDF' className='w-full h-80 rounded-xl border border-slate-200 bg-white' />
                ) : (
                  <div className='rounded-xl border border-slate-200 bg-white p-2'>
                    <img src={uploadedInsuranceDocument.previewUrl} alt='Uploaded Insurance document' className='w-full max-h-80 object-contain rounded-lg' />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border-t border-gray-200 p-3 md:p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3 flex-shrink-0'>

            <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
              <button type='button' onClick={onClose} className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer'>Cancel</button>
              <button type='submit' disabled={isSubmitting} className='flex-1 md:flex-none px-6 md:px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>{isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Insurance' : 'Add Insurance')}</button>
            </div>
          </div>
        </form>
      </div>
      {scanningFile && (
        <DocumentScannerPreview
          file={scanningFile}
          onCancel={() => setScanningFile(null)}
          onConfirm={handleScannerConfirm}
        />
      )}

      {showAddReference && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40' onClick={() => { setShowAddReference(false); setNewReferenceName('') }}>
          <div className='bg-white rounded-xl shadow-2xl p-5 w-80 mx-4' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-3'>Add New Reference</h3>
            <input
              type='text'
              value={newReferenceName}
              onChange={(e) => setNewReferenceName(e.target.value)}
              placeholder='Enter reference name'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4'
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddReference() }}
            />
            <div className='flex justify-end gap-2'>
              <button type='button' onClick={() => { setShowAddReference(false); setNewReferenceName('') }} className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-semibold cursor-pointer'>Cancel</button>
              <button type='button' onClick={handleAddReference} className='px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer'>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddInsuranceModal
