import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { openRazorpayCheckout } from '../../utils/razorpay'
import { PLANS_CONFIG } from '../../config/plansConfig'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const FEATURE_ROWS = [
  { key: 'aiDocuments', label: 'AI Documents / Month', render: (f) => (f.aiDocuments > 0 ? `${f.aiDocuments}` : '—') },
  { key: 'manualDocuments', label: 'Manual Documents / Month', render: (f) => (f.manualDocuments > 0 ? `${f.manualDocuments}` : '—') },
  { key: 'clientLimit', label: 'Clients', render: (f) => (f.clientLimit === 0 ? 'Unlimited' : `${f.clientLimit}`) },
  { key: 'desktopAccess', label: 'Access from Desktop/Laptop', render: (f) => f.desktopAccess },
  { key: 'mobileAppAccess', label: 'Access from Mobile App', render: (f) => f.mobileAppAccess },
  { key: 'premiumCalculator', label: 'Premium Calculator', render: () => true },
  { key: 'excelDownload', label: 'Excel Download', render: (f) => f.excelDownload },
  { key: 'appNotificationRenewal', label: 'App Notification Renewal Reminder', render: (f) => f.appNotificationRenewal },
  { key: 'whatsappRenewal', label: 'WhatsApp Renewal Reminder', render: (f) => f.whatsappRenewal },
  { key: 'customizedPolicyDownload', label: 'Personalised Policy Download', render: (f) => f.customizedPolicyDownload },
  { key: 'personalisedQuotation', label: 'Personalised Quotation', render: (f) => f.personalisedQuotation },
  { key: 'processingSpeed', label: 'Processing Speed', render: (f) => f.processingSpeed },
  { key: 'support', label: 'Support', render: (f) => f.support },
]

const formatPrice = (plan) => {
  if (plan.price === 0) return { amount: '₹0', period: 'for 1 Year' }
  const months = Math.round((plan.durationDays || 30) / 30)
  return { amount: `₹${plan.price}`, period: months > 1 ? `/ ${months} Months (incl. GST)` : '/ Month (incl. GST)' }
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
      <span className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100'>
        <svg className='h-3 w-3 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
        </svg>
      </span>
    ) : (
      <span className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100'>
        <svg className='h-3 w-3 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </span>
    )
  }
  return <span className='text-xs font-bold text-slate-700 whitespace-nowrap'>{value}</span>
}

const PricingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans] = useState(PLANS_CONFIG)
  const [myPlan, setMyPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasingPlanId, setPurchasingPlanId] = useState(null)

  const fetchMyPlan = async () => {
    try {
      const myPlanRes = await axios.get(`${API_URL}/api/user-plans/my-plan`, { withCredentials: true })
      setMyPlan(myPlanRes?.data?.data || null)
    } catch (_error) {
      // ignore
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchMyPlan()
      } catch (error) {
        console.error('Error loading user plan:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myPlanConfig = PLANS_CONFIG.find((p) => p.id === myPlan?.planKey) || null
  const currentPlanName = (myPlan?.planKey || 'free').toLowerCase()
  const currentFeatures = myPlanConfig?.features

  const handleBuyPlan = async (plan) => {
    if (!user) {
      toast.info('Please sign in to purchase or upgrade a plan.')
      navigate('/login')
      return
    }

    if (plan.price === 0) {
      toast.info('Free plan is active by default for new accounts.')
      return
    }

    setPurchasingPlanId(plan.id || plan.name)

    try {
      // 1. Create Razorpay Order on Backend
      const orderRes = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
          planKey: plan.id,
          planName: plan.name,
          price: plan.price,
          durationDays: plan.durationDays,
        },
        { withCredentials: true }
      )

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Failed to create payment order')
      }

      const { order_id, amount, currency, key_id } = orderRes.data

      // 2. Open Razorpay Checkout Modal
      openRazorpayCheckout({
        order_id,
        amount,
        currency,
        key_id,
        name: 'BimaBox',
        description: `${plan.name} Subscription Plan`,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.mobile || '',
        },
        onSuccess: async (paymentResponse) => {
          try {
            // 3. Verify Payment Signature on Backend & Activate Plan
            const verifyRes = await axios.post(
              `${API_URL}/api/payment/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                planKey: plan.id,
                planName: plan.name,
                planDetails: plan,
              },
              { withCredentials: true }
            )

            if (verifyRes.data?.success) {
              toast.success(`Payment successful! Welcome to ${plan.name} plan. 🎉`, { autoClose: 4000 })
              await fetchMyPlan()
            } else {
              toast.error(verifyRes.data?.message || 'Payment verification failed.')
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr)
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed.')
          } finally {
            setPurchasingPlanId(null)
          }
        },
        onFailure: (err) => {
          console.error('Razorpay payment failed:', err)
          toast.error(err.description || 'Payment failed or cancelled.')
          setPurchasingPlanId(null)
        },
        onDismiss: () => {
          toast.info('Payment window closed.')
          setPurchasingPlanId(null)
        },
      })
    } catch (error) {
      console.error('Error starting checkout:', error)
      toast.error(error.response?.data?.message || error.message || 'Error starting payment process.')
      setPurchasingPlanId(null)
    }
  }

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
                <h2 className='text-lg font-black text-slate-900'>{myPlanConfig?.name || myPlan?.name || 'Free'}</h2>
              </div>
              <div className='text-right'>
                <p className='text-[9px] font-bold uppercase tracking-widest text-slate-400'>
                  {myPlan.status === 'expired' ? 'Expired On' : myPlan.expiryDate ? 'Renews / Expires On' : 'Plan Duration'}
                </p>
                <p className={`text-sm font-bold ${myPlan.status === 'expired' ? 'text-rose-600' : 'text-slate-800'}`}>
                  {myPlan.expiryDate ? new Date(myPlan.expiryDate).toLocaleDateString() : 'Never Expires'}
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
              const isCurrent = plan.name.toLowerCase() === currentPlanName
              const highlight = plan.badge || plan.name === 'Plus'
              const isPurchasingThis = purchasingPlanId === plan.id || purchasingPlanId === plan.name

              return (
                <div
                  key={plan.id || plan.name}
                  className={`relative flex flex-col rounded-[28px] border p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] transition-all duration-300 animate-slideUp hover:-translate-y-1 hover:shadow-[0_32px_70px_-30px_rgba(15,23,42,0.3)] ${
                    isCurrent
                      ? 'border-blue-400 bg-gradient-to-b from-blue-50/60 to-white ring-2 ring-blue-200'
                      : highlight
                        ? 'border-indigo-300 bg-white ring-1 ring-indigo-100'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  {isCurrent && (
                    <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-500/30'>
                      Current Plan
                    </span>
                  )}
                  {!isCurrent && plan.badge && (
                    <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-indigo-500/30'>
                      {plan.badge}
                    </span>
                  )}
                  <h3 className='text-center text-base font-black uppercase tracking-wide text-slate-900 mt-2'>{plan.name}</h3>
                  <div className='text-center mt-2 mb-4 pb-4 border-b border-slate-100'>
                    <span className='text-3xl font-black text-slate-900'>{amount}</span>
                    <span className='block text-[11px] font-bold text-slate-400'>{period}</span>
                  </div>

                  <div className='flex-1 divide-y divide-slate-100'>
                    {FEATURE_ROWS.map((row) => (
                      <div key={row.key} className='flex items-center justify-between gap-3 py-2.5'>
                        <span className='text-[11px] font-semibold text-slate-500'>{row.label}</span>
                        <div className='flex shrink-0 justify-end'>
                          <FeatureValue value={row.render(plan.features || {})} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <div className='mt-5 flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-bold text-blue-700'>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                      </svg>
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyPlan(plan)}
                      disabled={isPurchasingThis}
                      className='mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 text-sm font-bold shadow-md shadow-blue-500/10 transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isPurchasingThis ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>{plan.price === 0 ? 'Free Plan' : 'Subscribe Now'}</span>
                          <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                          </svg>
                        </>
                      )}
                    </button>
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
