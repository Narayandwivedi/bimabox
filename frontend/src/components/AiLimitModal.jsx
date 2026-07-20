import { useNavigate } from 'react-router-dom'

/**
 * AiLimitModal
 *
 * Shows a premium upgrade prompt when the user's AI OCR quota is exhausted.
 * Accepts:
 *   isOpen   {boolean}   - Whether to display the modal
 *   onClose  {function}  - Called when the user dismisses the modal
 *   used     {number}    - AI documents used this month
 *   limit    {number}    - AI documents allowed per month (0 = unlimited)
 */
const AiLimitModal = ({ isOpen, onClose, used = 0, limit = 0 }) => {
  const navigate = useNavigate()

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
        className='relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='ai-limit-title'
      >
        {/* Top gradient banner */}
        <div className='h-1.5 w-full' style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #db2777)' }} />

        <div className='p-6'>
          {/* Icon */}
          <div className='flex justify-center mb-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full' style={{ background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)' }}>
              <svg className='h-8 w-8' viewBox='0 0 24 24' fill='none' stroke='url(#ai-grad)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                <defs>
                  <linearGradient id='ai-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%' stopColor='#4f46e5' />
                    <stop offset='100%' stopColor='#db2777' />
                  </linearGradient>
                </defs>
                <path d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z' />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            id='ai-limit-title'
            className='text-center text-xl font-bold text-slate-800 mb-1'
          >
            AI Scan Limit Reached
          </h2>

          {/* Usage bar */}
          {limit > 0 && (
            <div className='mt-3 mb-4 px-1'>
              <div className='flex justify-between text-xs font-semibold text-slate-500 mb-1'>
                <span>Used this month</span>
                <span className='text-rose-600 font-bold'>{used} / {limit}</span>
              </div>
              <div className='h-2.5 w-full rounded-full bg-slate-100 overflow-hidden'>
                <div
                  className='h-full rounded-full'
                  style={{
                    width: `${Math.min(100, Math.round((used / limit) * 100))}%`,
                    background: 'linear-gradient(90deg, #f43f5e, #be123c)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Body text */}
          <p className='text-center text-sm text-slate-600 mb-5 leading-relaxed'>
            You've used all <span className='font-semibold text-slate-800'>{limit}</span> AI document scans for this month.
            Upgrade your plan to get more scans and unlock premium features.
          </p>

          {/* Buttons */}
          <div className='flex flex-col gap-2.5'>
            <button
              onClick={handleUpgrade}
              className='w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer'
              style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              ✨ Upgrade Plan
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

export default AiLimitModal
