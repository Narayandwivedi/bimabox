import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UpgradePopup = ({ isOpen, onClose, title = 'Upgrade to Plus', message = 'This feature is available on the Plus plan. Upgrade to Plus to unlock it.' }) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleUpgrade = () => {
    onClose()
    navigate('/pricing')
  }

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='upgrade-popup-title'
      >
        {/* Top gradient banner */}
        <div className='h-1.5 w-full' style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #db2777)' }} />

        {/* Close button */}
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer'
        >
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <div className='p-6'>
          {/* Icon */}
          <div className='flex justify-center mb-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full' style={{ background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)' }}>
              <svg className='h-8 w-8' viewBox='0 0 24 24' fill='none' stroke='url(#upgrade-grad)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                <defs>
                  <linearGradient id='upgrade-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%' stopColor='#4f46e5' />
                    <stop offset='100%' stopColor='#db2777' />
                  </linearGradient>
                </defs>
                <path d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z' />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 id='upgrade-popup-title' className='text-center text-xl font-bold text-slate-800 mb-1'>
            {title}
          </h2>

          {/* Body text */}
          <p className='text-center text-sm text-slate-600 mb-5 leading-relaxed'>
            {message}
          </p>

          {/* Buttons */}
          <div className='flex flex-col gap-2.5'>
            <button
              onClick={handleUpgrade}
              className='w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer'
              style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              ✨ Upgrade to Plus
            </button>
            <button
              onClick={onClose}
              className='w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all cursor-pointer'
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradePopup
