import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getTodayDate as utilGetTodayDate, handleSmartDateInput, normalizeAIExtractedDate } from '../../utils/dateFormatter'
import { pdfToImages } from '../../utils/pdfToImages'
import DocumentScannerPreview from '../../components/DocumentScannerPreview'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const INSURANCE_COMPANIES = [
  'Acko General Insurance Limited',
  'Bajaj Allianz General Insurance Company Limited',
  'Cholamandalam MS General Insurance Company Limited',
  'Navi General Insurance Limited',
  'Edelweiss General Insurance Company Limited',
  'Future Generali India Insurance Company Limited',
  'Go Digit General Insurance Limited',
  'HDFC ERGO General Insurance Company Limited',
  'ICICI Lombard General Insurance Company Limited',
  'IFFCO Tokio General Insurance Company Limited',
  'Kotak Mahindra General Insurance Company Limited',
  'Liberty General Insurance Limited',
  'Magma HDI General Insurance Company Limited',
  'Niva Bupa Health Insurance Company Limited',
  'National Insurance Company Limited',
  'Raheja QBE General Insurance Company Limited',
  'Reliance General Insurance Company Limited',
  'Royal Sundaram General Insurance Company Limited',
  'SBI General Insurance Company Limited',
  'Shriram General Insurance Company Limited',
  'Star Health & Allied Insurance Company Limited',
  'Tata AIG General Insurance Company Limited',
  'The New India Assurance Company Limited',
  'The Oriental Insurance Company Limited',
  'United India Insurance Company Limited',
  'Universal Sompo General Insurance Company Limited',
  'Life Insurance Corporation of India (LIC)',
  'HDFC Life Insurance Co. Ltd.',
  'Max Life Insurance Co. Ltd.',
  'ICICI Prudential Life Insurance Co. Ltd.',
  'Kotak Mahindra Life Insurance Co. Ltd.',
  'Aditya Birla Sun Life Insurance Co. Ltd.',
  'Tata AIA Life Insurance Co. Ltd.',
  'SBI Life Insurance Co. Ltd.',
  'Bajaj Allianz Life Insurance Co. Ltd.',
  'PNB MetLife India Insurance Co. Ltd.',
  'Reliance Nippon Life Insurance Company Limited',
  'Aviva Life Insurance Company India Ltd.',
  'Sahara India Life Insurance Co. Ltd.',
  'Shriram Life Insurance Co. Ltd.',
  'Bharti AXA Life Insurance Company Ltd.',
  'Future Generali India Life Insurance Company Limited',
  'Ageas Federal Life Insurance Company Limited',
  'Canara HSBC Life Insurance Company Limited',
  'Aegon Life Insurance Company Limited',
  'Pramerica Life Insurance Co. Ltd.',
  'Star Union Dai-ichi Life Insurance Co. Ltd.',
  'IndiaFirst Life Insurance Company Ltd.',
  'Edelweiss Tokio Life Insurance Company Limited'
].sort()


const PRODUCT_TYPE_OPTIONS = [
  'GCV', 'GCV-3W', 'Pvt. Car', 'Taxi', 'Two Wheeler', 'Mis-D', 'PCV', 'PCV-3W',
  'Health', 'Life', 'Fire', 'Burglary', 'WC', 'CPM', 'Travel', 'Marine', 'GPA', 'GMC'
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

const PRODUCT_TYPE_KEYWORD_MAP = [
  { value: 'Two Wheeler', keywords: ['two wheeler', 'two-wheeler', '2 wheeler', '2-wheeler', 'motor cycle', 'motorcycle', 'motor bike', 'bike', 'scooter'] },
  { value: 'Taxi', keywords: ['taxi', 'cab'] },
  { value: 'GCV-3W', keywords: ['gcv-3w', 'gcv 3w', 'goods carrying vehicle 3 wheeler', 'goods 3 wheeler'] },
  { value: 'PCV-3W', keywords: ['pcv-3w', 'pcv 3w', 'passenger carrying vehicle 3 wheeler', 'passenger 3 wheeler', 'auto rickshaw', 'three wheeler'] },
  { value: 'GCV', keywords: ['gcv', 'goods carrying vehicle', 'goods carrying', 'commercial vehicle', 'truck', 'lorry'] },
  { value: 'PCV', keywords: ['pcv', 'passenger carrying vehicle', 'passenger carrying', 'bus'] },
  { value: 'Pvt. Car', keywords: ['private car', 'pvt car', 'pvt. car', 'personal car', 'own damage car', 'car policy'] },
  { value: 'Mis-D', keywords: ['miscellaneous d', 'mis-d', 'mis d'] },
  { value: 'Health', keywords: ['health', 'mediclaim', 'medical insurance'] },
  { value: 'Life', keywords: ['life insurance', 'term insurance', 'term plan'] },
  { value: 'Fire', keywords: ['fire insurance', 'fire policy', 'standard fire', 'fire and special perils'] },
  { value: 'Burglary', keywords: ['burglary'] },
  { value: 'WC', keywords: ['workmen', 'workmens compensation', "workmen's compensation", 'wc policy'] },
  { value: 'CPM', keywords: ['contractors plant', 'cpm'] },
  { value: 'Travel', keywords: ['travel insurance', 'travel policy'] },
  { value: 'Marine', keywords: ['marine'] },
  { value: 'GPA', keywords: ['group personal accident', 'gpa', 'personal accident'] },
  { value: 'GMC', keywords: ['group mediclaim', 'gmc'] }
]

const normalizeProductType = (productType) => {
  if (!productType) return ''
  const cleaned = productType.trim().toLowerCase()
  const directMatch = PRODUCT_TYPE_OPTIONS.find(p => p.toLowerCase() === cleaned)
  if (directMatch) return directMatch
  for (const entry of PRODUCT_TYPE_KEYWORD_MAP) {
    if (entry.keywords.some(k => cleaned.includes(k))) return entry.value
  }
  return ''
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
    issueDate: utilGetTodayDate(),
    premium: '',
    insuranceDocument: '',
    endorsementDocument: '',
    insuranceCompany: '',
    insuranceClass: '',
    product: '',
    vehicleClass: '',
    remarks: '',
    reference: '',
    imd: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scanningFile, setScanningFile] = useState(null)
  const [isExtractingInsurance, setIsExtractingInsurance] = useState(false)
  const [uploadedInsuranceDocument, setUploadedInsuranceDocument] = useState(null)
  const [uploadedInsuranceFile, setUploadedInsuranceFile] = useState(null)
  const [uploadedEndorsementDocument, setUploadedEndorsementDocument] = useState(null)
  const [uploadedEndorsementFile, setUploadedEndorsementFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [references, setReferences] = useState([])
  const [referenceDropdownOpen, setReferenceDropdownOpen] = useState(false)
  const [referenceSearch, setReferenceSearch] = useState('')
  const [showAddReference, setShowAddReference] = useState(false)
  const [newReferenceName, setNewReferenceName] = useState('')

  const [imds, setImds] = useState([])
  const [imdDropdownOpen, setImdDropdownOpen] = useState(false)
  const [imdSearch, setImdSearch] = useState('')
  const [showAddImd, setShowAddImd] = useState(false)
  const [newImdName, setNewImdName] = useState('')

  useEffect(() => {
    return () => {
      if (uploadedInsuranceDocument?.revokeOnCleanup && uploadedInsuranceDocument.previewUrl) {
        URL.revokeObjectURL(uploadedInsuranceDocument.previewUrl)
      }
      if (uploadedEndorsementDocument?.revokeOnCleanup && uploadedEndorsementDocument.previewUrl) {
        URL.revokeObjectURL(uploadedEndorsementDocument.previewUrl)
      }
    }
  }, [uploadedInsuranceDocument, uploadedEndorsementDocument])

  useEffect(() => {
    if (initialData && isOpen) {
      const vehicleNum = initialData.vehicleNumber || ''
      setFormData({
        vehicleNumber: vehicleNum,
        policyNumber: initialData.policyNumber || '',
        policyHolderName: initialData.policyHolderName || '',
        validFrom: initialData.validFrom || '',
        validTo: initialData.validTo || '',
        issueDate: initialData.issueDate || utilGetTodayDate(),
        premium: initialData.premium != null ? String(initialData.premium) : '',
        insuranceDocument: initialData.insuranceDocument || '',
        endorsementDocument: initialData.endorsementDocument || '',
        insuranceCompany: initialData.insuranceCompany || '',
        insuranceClass: initialData.insuranceClass || '',
        product: initialData.product || '',
        vehicleClass: initialData.vehicleClass || '',
        remarks: initialData.remarks || '',
        reference: initialData.reference || '',
        imd: initialData.imd || ''
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
      setUploadedEndorsementDocument(
        initialData.endorsementDocument
          ? {
              name: 'endorsement-document',
              type: initialData.endorsementDocument.startsWith('data:application/pdf') || initialData.endorsementDocument.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
              previewUrl: resolveStoredDocumentPreview(initialData.endorsementDocument),
              revokeOnCleanup: false
            }
          : null
      )
      setUploadedInsuranceFile(null)
      setUploadedEndorsementFile(null)
      userEditedValidTo.current = true
    } else if (!isOpen) {
      setFormData({
        vehicleNumber: prefilledVehicleNumber,
        policyNumber: '',
        policyHolderName: prefilledOwnerName,
        validFrom: '',
        validTo: '',
        issueDate: utilGetTodayDate(),
        premium: '',
        insuranceDocument: '',
        endorsementDocument: '',
        insuranceCompany: '',
        insuranceClass: '',
        product: '',
        vehicleClass: '',
        remarks: '',
        reference: '',
        imd: ''
      })
      setScanningFile(null)
      setIsExtractingInsurance(false)
      setUploadedInsuranceDocument(prev => {
        if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
      setUploadedInsuranceFile(null)
      setUploadedEndorsementDocument(prev => {
        if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
      setUploadedEndorsementFile(null)
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
      const fetchImds = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/imd`, { withCredentials: true })
          if (res.data.success) setImds(res.data.data)
        } catch { }
      }
      fetchReferences()
      fetchImds()
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

  const handleImdSelect = (name) => {
    setFormData(prev => ({ ...prev, imd: name }))
    setImdDropdownOpen(false)
    setImdSearch('')
  }

  const handleAddImd = async () => {
    const name = newImdName.trim()
    if (!name) return
    try {
      const res = await axios.post(`${API_URL}/api/imd`, { name }, { withCredentials: true })
      if (res.data.success) {
        setImds(prev => {
          const exists = prev.find(r => r.name === name)
          return exists ? prev : [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name))
        })
        setFormData(prev => ({ ...prev, imd: name }))
        setNewImdName('')
        setShowAddImd(false)
        setImdDropdownOpen(false)
      }
    } catch { }
  }

  const filteredReferences = references.filter(r =>
    !referenceSearch || r.name.toLowerCase().includes(referenceSearch.toLowerCase())
  )

  const filteredImds = imds.filter(r =>
    !imdSearch || r.name.toLowerCase().includes(imdSearch.toLowerCase())
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
    if (name === 'issueDate') {
      if (value) {
        const [year, month, day] = value.split('-')
        const formatted = `${day}-${month}-${year}`
        setFormData(prev => ({ ...prev, [name]: formatted }))
      } else {
        setFormData(prev => ({ ...prev, [name]: '' }))
      }
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

  const applyOcrResult = (resultData) => {
    setFormData(prev => {
      const updated = { ...prev }
      Object.keys(resultData).forEach((key) => {
        const value = resultData[key]
        if (!value || !Object.prototype.hasOwnProperty.call(updated, key)) return
        if (key === 'validFrom' || key === 'validTo' || key === 'issueDate') {
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
        if (key === 'product') {
          const normalized = normalizeProductType(value)
          if (normalized) updated[key] = normalized
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
            applyOcrResult(resultData)
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
          if (error.response?.status === 422 && error.response?.data?.isScannedPdf && fileToProcess) {
            const fallbackToast = toast.info('Scanned PDF detected. Converting to images for visual analysis...', { autoClose: false, isLoading: true })
            try {
              const pageImages = await pdfToImages(fileToProcess, 2, 1.2, 0.7)
              if (pageImages && pageImages.length > 0) {
                toast.update(fallbackToast, { render: 'Analyzing scanned document with Vision AI...', isLoading: true })
                const visionResponse = await axios.post(
                  `${API_URL}/api/ocr/insurance`,
                  { imageBase64: pageImages[0], backImageBase64: pageImages[1] || null },
                  { withCredentials: true }
                )
                if (visionResponse.data.success && visionResponse.data.data) {
                  const resultData = visionResponse.data.data
                  isOcrUpdate.current = true
                  applyOcrResult(resultData)
                  setTimeout(() => { isOcrUpdate.current = false }, 500)
                  setUploadedInsuranceDocument(prev => {
                    if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
                    return {
                      name: fileToProcess.name || 'insurance-document',
                      type: 'pdf',
                      previewUrl: URL.createObjectURL(fileToProcess),
                      revokeOnCleanup: true
                    }
                  })
                  toast.dismiss(fallbackToast)
                  toast.success('Insurance details extracted successfully via Vision!', { position: 'top-right', autoClose: 3000 })
                  return
                }
              }
            } catch (visionErr) {
              console.error('Vision fallback failed:', visionErr)
            }
            toast.dismiss(fallbackToast)
            toast.error('Could not analyze the scanned PDF. Please fill details manually.', { position: 'top-right', autoClose: 4000 })
          } else {
            console.error(error)
            toast.dismiss(updateToast)
            toast.error('Server error during OCR processing.', { position: 'top-right', autoClose: 3000 })
          }
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

  const processInsuranceFile = (file) => {
    if (!file) return
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB.', { position: 'top-right', autoClose: 3000 })
      return false
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
      return true
    }
    toast.error('Please upload an image or PDF file.', { position: 'top-right', autoClose: 3000 })
    return false
  }

  const handleManualDocumentUpload = (e) => {
    const file = e.target.files?.[0]
    const success = processInsuranceFile(file)
    e.target.value = ''
    if (success && file) {
      if (file.type === 'application/pdf') {
        processExtraction(file)
      } else if (file.type.startsWith('image/')) {
        setScanningFile(file)
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    const success = processInsuranceFile(file)
    if (success && file) {
      if (file.type === 'application/pdf') {
        processExtraction(file)
      } else if (file.type.startsWith('image/')) {
        setScanningFile(file)
      }
    }
  }

  const handleManualEndorsementUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB.', { position: 'top-right', autoClose: 3000 })
      e.target.value = ''
      return
    }

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setUploadedEndorsementFile(file)
      setUploadedEndorsementDocument(prev => {
        if (prev?.revokeOnCleanup && prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return {
          name: file.name || 'endorsement-document',
          type: file.type === 'application/pdf' ? 'pdf' : 'image',
          previewUrl: URL.createObjectURL(file),
          revokeOnCleanup: true
        }
      })
      toast.success('Endorsement attached successfully!', { position: 'top-right', autoClose: 2000 })
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
    if (currentTabIndex === 7) {
      document.querySelector('form')?.requestSubmit()
      return
    }
    const nextInput = document.querySelector(`input[tabIndex="${currentTabIndex + 1}"]`)
    if (nextInput) nextInput.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.issueDate) {
      toast.error('Issue Date is required')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)

    let uploadedDocumentPath = formData.insuranceDocument;
    let uploadedEndorsementPath = formData.endorsementDocument;

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

    if (uploadedEndorsementFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('document', uploadedEndorsementFile);
      try {
        const uploadResponse = await axios.post(`${API_URL}/api/upload/document`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        if (uploadResponse.data.success) {
           uploadedEndorsementPath = uploadResponse.data.data.path;
        } else {
           toast.error('Failed to upload endorsement to server');
           setIsSubmitting(false);
           return;
        }
      } catch (err) {
         console.error('Endorsement Upload Error:', err);
         toast.error(err.response?.data?.message || `Failed to upload endorsement: ${err.message}. Ensure it is not larger than 15MB.`);
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
      issueDate: formData.issueDate,
      insuranceDocument: uploadedDocumentPath,
      endorsementDocument: uploadedEndorsementPath,
      insuranceCompany: formData.insuranceCompany,
      insuranceClass: formData.insuranceClass,
      product: formData.product,
      vehicleClass: formData.vehicleClass,
      remarks: formData.remarks,
      reference: formData.reference,
      imd: formData.imd
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
    <div
      className='fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4'
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] md:max-h-[95vh] overflow-hidden flex flex-col relative'>
        {isDragOver && (
          <div className='absolute inset-0 z-50 flex items-center justify-center bg-indigo-600/90 rounded-xl md:rounded-2xl'>
            <div className='text-white text-center px-6'>
              <svg className='w-12 h-12 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
              </svg>
              <p className='text-xl font-bold'>Drop your file here</p>
              <p className='text-sm text-indigo-200 mt-1'>PDF or Image (max 15MB)</p>
            </div>
          </div>
        )}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>{isEditMode ? 'Edit Insurance' : 'Add New Insurance'}</h2>
              <p className='text-blue-100 text-xs md:text-sm mt-1'>{isEditMode ? 'Update insurance record' : 'Add insurance record'}</p>
            </div>
            <div className='flex items-center gap-1 md:gap-3'>
              <div className='relative overflow-hidden'>
                <button type='button' className='relative px-1.5 py-1 md:px-3 md:py-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] md:text-sm font-semibold rounded-lg transition flex items-center gap-1 md:gap-2 max-w-full'>
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Doc
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
              <div className='grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Issue Date <span className='text-red-500'>*</span></label>
                  <input type='date' name='issueDate' value={formData.issueDate ? formData.issueDate.split('-').reverse().join('-') : ''} onChange={handleChange} tabIndex='1' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white' required />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Vehicle Number</label>
                  <div className='relative'>
                    <input type='text' name='vehicleNumber' value={formData.vehicleNumber} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='Enter vehicle number' tabIndex='2' className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono bg-white' autoFocus />
                  </div>
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Policy Number</label>
                  <input type='text' name='policyNumber' value={formData.policyNumber} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='INS001234567' tabIndex='3' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono bg-white' />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Policy Holder Name</label>
                  <input type='text' name='policyHolderName' value={formData.policyHolderName} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='Enter policy holder name' tabIndex='4' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white' />
                </div>
                <div className='md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                  <div>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Insurance Company</label>
                    <select 
                      name='insuranceCompany' 
                      value={formData.insuranceCompany} 
                      onChange={handleChange} 
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'
                    >
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
                      {PRODUCT_TYPE_OPTIONS.map(product => (
                        <option key={product} value={product}>{product}</option>
                      ))}
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
                </div>

                <div className='md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  <div className='relative'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700'>Client Name</label>
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
                        placeholder='Select or type Client Name...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white pr-10'
                      />
                      {formData.reference && !referenceDropdownOpen ? (
                        <button
                          type='button'
                          onClick={() => setFormData(prev => ({ ...prev, reference: '' }))}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer'
                          title='Clear Client Name'
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
                            {referenceSearch ? 'No matching Client Name found' : 'No Client Names yet'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className='relative'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700'>Agent Name (IMD)</label>
                      <button
                        type='button'
                        onClick={() => { setShowAddImd(true); setNewImdName('') }}
                        className='text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center cursor-pointer'
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
                        value={imdDropdownOpen ? imdSearch : formData.imd}
                        onFocus={() => { setImdSearch(''); setImdDropdownOpen(true) }}
                        onChange={(e) => { setImdSearch(e.target.value); setImdDropdownOpen(true) }}
                        onBlur={() => setTimeout(() => setImdDropdownOpen(false), 200)}
                        placeholder='Select or type Agent name...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white pr-10'
                      />
                      {formData.imd && !imdDropdownOpen ? (
                        <button
                          type='button'
                          onClick={() => setFormData(prev => ({ ...prev, imd: '' }))}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer'
                          title='Clear Agent name'
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type='button'
                          onClick={() => setImdDropdownOpen(prev => !prev)}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        </button>
                      )}
                    </div>
                    {imdDropdownOpen && (
                      <div className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                        {filteredImds.length > 0 ? (
                          filteredImds.map((ref) => (
                            <button
                              key={ref._id}
                              type='button'
                              onMouseDown={() => handleImdSelect(ref.name)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition cursor-pointer ${formData.imd === ref.name ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700'}`}
                            >
                              {ref.name}
                            </button>
                          ))
                        ) : (
                          <div className='px-3 py-2 text-sm text-gray-400'>
                            {imdSearch ? 'No matching Agent name found' : 'No Agent names yet'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='md:col-span-4 mt-3 md:mt-4'>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Notes</label>
                  <textarea name='remarks' value={formData.remarks} onChange={handleChange} rows='2' placeholder='Any additional notes...' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none' />
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
                  <input type='text' name='validFrom' value={formData.validFrom} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder={getTodayDate()} tabIndex='5' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white' required />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Valid To <span className='text-xs text-blue-500'>(Auto-calculated, editable)</span></label>
                  <input type='text' name='validTo' value={formData.validTo} onChange={handleChange} onKeyDown={handleInputKeyDown} placeholder='DD-MM-YYYY' tabIndex='6' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white' />
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
                      tabIndex='7'
                      className='w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.414 6.586a6 6 0 108.484 8.484L20.5 13" />
                </svg>
                Upload Endorsement
              </h3>
              <div className='relative overflow-hidden'>
                <button type='button' className='w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer'>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choose Endorsement File
                </button>
                <input type='file' accept='image/*, application/pdf' onChange={handleManualEndorsementUpload} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
              </div>
              {uploadedEndorsementDocument && (
                <div className='mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2 border border-amber-200'>
                  <div className='min-w-0 flex items-center gap-2'>
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className='text-sm font-semibold text-slate-800 truncate'>{uploadedEndorsementDocument.name}</p>
                  </div>
                  <button type='button' onClick={() => { setUploadedEndorsementDocument(null); setUploadedEndorsementFile(null); setFormData(prev => ({ ...prev, endorsementDocument: '' })) }} className='text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer'>Remove</button>
                </div>
              )}
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

            {uploadedEndorsementDocument && (
              <div className='bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
                <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                  <span className='bg-amber-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>E</span>
                  Uploaded Endorsement Document
                </h3>
                <div className='mb-3 flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2 border border-amber-200'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-800 truncate'>{uploadedEndorsementDocument.name}</p>
                    <p className='text-xs text-slate-500'>{uploadedEndorsementDocument.type === 'pdf' ? 'PDF preview' : 'Image preview'}</p>
                  </div>
                </div>
                {uploadedEndorsementDocument.type === 'pdf' ? (
                  <iframe src={uploadedEndorsementDocument.previewUrl} title='Uploaded Endorsement PDF' className='w-full h-80 rounded-xl border border-slate-200 bg-white' />
                ) : (
                  <div className='rounded-xl border border-slate-200 bg-white p-2'>
                    <img src={uploadedEndorsementDocument.previewUrl} alt='Uploaded Endorsement document' className='w-full max-h-80 object-contain rounded-lg' />
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
            <h3 className='text-base font-bold text-gray-800 mb-3'>Add New Client Name</h3>
            <input
              type='text'
              value={newReferenceName}
              onChange={(e) => setNewReferenceName(e.target.value)}
              placeholder='Enter Client Name'
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

      {showAddImd && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40' onClick={() => { setShowAddImd(false); setNewImdName('') }}>
          <div className='bg-white rounded-xl shadow-2xl p-5 w-80 mx-4' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-3'>Add New Agent name</h3>
            <input
              type='text'
              value={newImdName}
              onChange={(e) => setNewImdName(e.target.value)}
              placeholder='Enter Agent name'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4'
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddImd() }}
            />
            <div className='flex justify-end gap-2'>
              <button type='button' onClick={() => { setShowAddImd(false); setNewImdName('') }} className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-semibold cursor-pointer'>Cancel</button>
              <button type='button' onClick={handleAddImd} className='px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold cursor-pointer'>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddInsuranceModal
