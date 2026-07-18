import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const FEATURE_ROWS = [
  { key: 'aiDocuments', label: 'AI Documents / Month', render: (f) => f.aiDocuments > 0 ? `${f.aiDocuments}` : '—' },
  { key: 'manualDocuments', label: 'Manual Documents / Month', render: (f) => f.manualDocuments > 0 ? `${f.manualDocuments}` : '—' },
  { key: 'clientLimit', label: 'Clients', render: (f) => f.clientLimit === 0 ? 'Unlimited' : `${f.clientLimit}` },
  { key: 'desktopAccess', label: 'Access from Desktop/Laptop', render: (f) => f.desktopAccess },
  { key: 'mobileAppAccess', label: 'Access from Mobile App', render: (f) => f.mobileAppAccess },
  { key: 'excelDownload', label: 'Excel Download', render: (f) => f.excelDownload },
  { key: 'appNotificationRenewal', label: 'App Notification Renewal Reminder', render: (f) => f.appNotificationRenewal },
  { key: 'whatsappRenewal', label: 'WhatsApp Renewal Reminder', render: (f) => f.whatsappRenewal },
  { key: 'customizedPolicyDownload', label: 'Customized Policy Download', render: (f) => f.customizedPolicyDownload },
  { key: 'processingSpeed', label: 'Processing Speed', render: (f) => f.processingSpeed },
  { key: 'support', label: 'Support', render: (f) => f.support },
]

const formatPrice = (plan) => {
  if (plan.price === 0) return { amount: '₹0', period: 'Forever' }
  const months = Math.round((plan.durationDays || 30) / 30)
  return { amount: `₹${plan.price}`, period: months > 1 ? `/ ${months} Months` : '/ Month' }
}

const UsageBar = ({ label, used, limit }) => {
  const unlimited = !limit || limit <= 0
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const near = !unlimited && pct >= 90
  return (
    <div>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-[11px] font-bold text-slate-500'>{label}</span>
        <span className='text-[11px] font-black text-slate-700'>
          {used} {unlimited ? '' : `/ ${limit}`}
        </span>
      </div>
      <div className='h-2 w-full rounded-full bg-slate-100 overflow-hidden'>
        <div
          className={`h-full rounded-full transition-all ${near ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
          style={{ width: unlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  )
}

const FeatureValue = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className='h-4 w-4 text-emerald-500 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
      </svg>
    ) : (
      <svg className='h-4 w-4 text-slate-300 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
      </svg>
    )
  }
  return <span className='text-xs font-bold text-slate-700'>{value}</span>
}

const PricingPage = () => {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [myPlan, setMyPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, myPlanRes] = await Promise.all([
          axios.get(`${API_URL}/api/subscription-plans`),
          axios.get(`${API_URL}/api/user-plans/my-plan`, { withCredentials: true }).catch(() => null),
        ])
        const activePlans = (plansRes.data?.data || []).filter((p) => p.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setPlans(activePlans)
        setMyPlan(myPlanRes?.data?.data || null)
      } catch (error) {
        console.error('Error loading plans:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentPlanId = myPlan?.planId?._id
  const currentFeatures = myPlan?.planId?.features

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-32 pt-6 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-6 animate-fadeIn'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20'>
              <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 7h6m0 10v-3m-6 3v-3m-3.6-7.2L12 2l6.6 4.8M4.5 9.75v9a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-9' />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-black text-slate-900'>Pricing &amp; Plans</h1>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Choose the plan that fits your business</p>
            </div>
          </div>
        </div>

        {myPlan && (
          <div className='mb-6 animate-slideUp rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-6'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
              <div>
                <p className='text-[9px] font-bold uppercase tracking-widest text-slate-400'>Current Plan</p>
                <h2 className='text-lg font-black text-slate-900'>{myPlan.planId?.name || 'Free'}</h2>
              </div>
              <div className='text-right'>
                <p className='text-[9px] font-bold uppercase tracking-widest text-slate-400'>
                  {myPlan.status === 'expired' ? 'Expired On' : 'Renews / Expires On'}
                </p>
                <p className={`text-sm font-bold ${myPlan.status === 'expired' ? 'text-rose-600' : 'text-slate-800'}`}>
                  {myPlan.expiryDate ? new Date(myPlan.expiryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            {currentFeatures && (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <UsageBar label='AI Documents' used={myPlan.usage?.aiDocumentsUsed || 0} limit={currentFeatures.aiDocuments} />
                <UsageBar label='Manual Documents' used={myPlan.usage?.manualDocumentsUsed || 0} limit={currentFeatures.manualDocuments} />
                <UsageBar label='Clients' used={myPlan.clientsUsed ?? 0} limit={currentFeatures.clientLimit} />
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className='py-20 text-center text-sm font-semibold text-slate-400'>Loading plans...</div>
        ) : (
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {plans.map((plan) => {
              const { amount, period } = formatPrice(plan)
              const isCurrent = plan._id === currentPlanId
              const highlight = plan.name === 'Plus'
              return (
                <div
                  key={plan._id}
                  className={`relative flex flex-col rounded-[28px] border p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] animate-slideUp ${
                    isCurrent
                      ? 'border-blue-400 bg-gradient-to-b from-blue-50/60 to-white ring-2 ring-blue-200'
                      : highlight
                        ? 'border-indigo-200 bg-white'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  {isCurrent && (
                    <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md'>
                      Current Plan
                    </span>
                  )}
                  {!isCurrent && highlight && (
                    <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md'>
                      Popular
                    </span>
                  )}
                  <h3 className='text-center text-base font-black uppercase tracking-wide text-slate-900 mt-2'>{plan.name}</h3>
                  <div className='text-center mt-2 mb-4'>
                    <span className='text-3xl font-black text-slate-900'>{amount}</span>
                    <span className='block text-[11px] font-bold text-slate-400'>{period}</span>
                  </div>

                  <div className='flex-1 divide-y divide-slate-100 border-t border-slate-100'>
                    {FEATURE_ROWS.map((row) => (
                      <div key={row.key} className='flex items-center justify-between py-2.5'>
                        <span className='text-[11px] font-semibold text-slate-500 pr-2'>{row.label}</span>
                        <FeatureValue value={row.render(plan.features || {})} />
                      </div>
                    ))}
                  </div>

                  {!isCurrent && (
                    <a
                      href='/contact-us'
                      className='mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all'
                    >
                      {user ? 'Contact Us to Upgrade' : 'Get Started'}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingPage
