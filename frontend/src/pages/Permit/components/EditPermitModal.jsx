import { useState, useEffect } from 'react'
import { handleDateBlur as utilHandleDateBlur, handleSmartDateInput } from '../../../utils/dateFormatter'
import { validateVehicleNumberRealtime } from '../../../utils/vehicleNoCheck'

const EditPermitModal = ({ isOpen, onClose, onSubmit, permit }) => {
  const [vehicleValidation, setVehicleValidation] = useState({ isValid: false, message: '' })
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    name: '',
    validFrom: '',
    validTo: '',
    permitDocumentData: ''
  })
  
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    if (permit) {
      setFormData({
        vehicleNumber: permit.vehicleNumber || '',
        name: permit.name || '',
        validFrom: permit.validFrom || '',
        validTo: permit.validTo || '',
        permitDocumentData: ''
      })
      if (permit.vehicleNumber) {
        setVehicleValidation(validateVehicleNumberRealtime(permit.vehicleNumber))
      }
      setFileName(permit.permitDocument ? permit.permitDocument.split('/').pop() : '')
    }
  }, [permit])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'vehicleNumber') {
      const upperValue = value.toUpperCase()
      const validation = (upperValue.length === 9 || upperValue.length === 10)
        ? validateVehicleNumberRealtime(upperValue)
        : { isValid: false, message: '' }
      setVehicleValidation(validation)
      setFormData(prev => ({ ...prev, [name]: upperValue }))
      return
    }

    if (name === 'validFrom' || name === 'validTo') {
      const formatted = handleSmartDateInput(value, formData[name] || '')
      if (formatted !== null) {
        setFormData(prev => ({ ...prev, [name]: formatted }))
      }
      return
    }

    const uppercaseFields = ['name']
    const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value
    setFormData(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleDateBlur = (e) => {
    utilHandleDateBlur(e, setFormData)
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        permitDocumentData: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!vehicleValidation.isValid && formData.vehicleNumber) {
      alert('Please enter a valid vehicle number in the format: CG04AA1234')
      return
    }

    if (onSubmit) {
      onSubmit(formData)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-teal-600 to-emerald-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Edit Permit</h2>
              <p className='text-teal-100 text-xs md:text-sm mt-1'>Update vehicle permit record</p>
            </div>
            <button onClick={onClose} className='text-white hover:bg-white/20 rounded-lg p-1.5 md:p-2 transition cursor-pointer'>
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-3 md:p-6'>
            {/* Details */}
            <div className='bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-slate-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Permit Details
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Vehicle Number <span className='text-red-500'>*</span></label>
                  <input
                    type='text'
                    name='vehicleNumber'
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder='CG04AA1234'
                    maxLength='10'
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
                      formData.vehicleNumber && !vehicleValidation.isValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    }`}
                    required
                  />
                  {vehicleValidation.message && (
                    <p className={`text-xs mt-1 ${vehicleValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {vehicleValidation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Name</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            {/* Validity */}
            <div className='bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-teal-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Validity Period
              </h3>

              <div className='grid grid-cols-2 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Valid From <span className='text-red-500'>*</span></label>
                  <input
                    type='text'
                    name='validFrom'
                    value={formData.validFrom}
                    onChange={handleChange}
                    onBlur={handleDateBlur}
                    placeholder='DD-MM-YYYY'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>Valid To <span className='text-red-500'>*</span></label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    onBlur={handleDateBlur}
                    placeholder='DD-MM-YYYY'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Document Upload */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                Upload Document
              </h3>
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  Permit Document (PDF or Image)
                </label>
                <div className='flex items-center gap-3'>
                  <label className='cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition'>
                    Choose File
                    <input type='file' accept='.pdf,image/*' className='hidden' onChange={handleFileChange} />
                  </label>
                  {fileName && <span className='text-xs text-gray-600 truncate max-w-[200px]'>{fileName}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-3 md:p-4 bg-gray-50 flex flex-col md:flex-row justify-end items-center gap-3 flex-shrink-0'>
            <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
              <button type='button' onClick={onClose} className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer'>
                Cancel
              </button>
              <button type='submit' className='flex-1 md:flex-none px-6 md:px-8 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer'>
                Update Permit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPermitModal
