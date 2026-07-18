import { useEffect, useState } from 'react'
import '../App.css'

const defaultPlanFeatures = {
  aiDocuments: 0, manualDocuments: 0, desktopAccess: false, mobileAppAccess: false,
  excelDownload: false, clientLimit: 0, appNotificationRenewal: false, whatsappRenewal: false,
  customizedPolicyDownload: false, processingSpeed: 'Standard', support: 'Standard',
}

function PlansPage({ apiFetch }) {
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [isEditPlan, setIsEditPlan] = useState(false)
  const [planForm, setPlanForm] = useState({ _id: '', name: '', price: '', durationDays: '', sortOrder: 0, features: { ...defaultPlanFeatures } })
  const [planMessage, setPlanMessage] = useState({ type: '', text: '' })
  const [planSaving, setPlanSaving] = useState(false)

  const fetchPlans = async () => {
    try {
      setPlansLoading(true)
      setPlanMessage({ type: '', text: '' })
      const result = await apiFetch('/api/subscription-plans')
      setPlans(result.data || [])
    } catch (error) {
      setPlanMessage({ type: 'error', text: error.message || 'Failed to fetch plans' })
    } finally {
      setPlansLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  return (
    <>
      <section className="panel panel-full">
        <div className="panel-header panel-header-row">
          <h2>Subscription Plans</h2>
          <div className="toolbar">
            <button type="button" className="secondary-btn" onClick={fetchPlans}>Refresh</button>
            <button type="button" className="primary-btn small-btn" onClick={() => {
              setPlanForm({ _id: '', name: '', price: '', durationDays: '', sortOrder: 0, features: { ...defaultPlanFeatures } })
              setPlanMessage({ type: '', text: '' })
              setIsEditPlan(false)
              setShowPlanModal(true)
            }}>
              Add Plan
            </button>
          </div>
        </div>

        {plansLoading ? (
          <div className="empty-state">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="empty-state">No subscription plans found.</div>
        ) : (
          <div className="plans-grid">
            {plans.map((p) => {
              const feat = p.features || {}

              const openEdit = () => {
                setPlanForm({
                  _id: p._id,
                  name: p.name,
                  price: String(p.price),
                  durationDays: String(p.durationDays),
                  sortOrder: p.sortOrder || 0,
                  features: {
                    aiDocuments: feat.aiDocuments ?? 0,
                    manualDocuments: feat.manualDocuments ?? 0,
                    desktopAccess: feat.desktopAccess ?? false,
                    mobileAppAccess: feat.mobileAppAccess ?? false,
                    excelDownload: feat.excelDownload ?? false,
                    clientLimit: feat.clientLimit ?? 0,
                    appNotificationRenewal: feat.appNotificationRenewal ?? false,
                    whatsappRenewal: feat.whatsappRenewal ?? false,
                    customizedPolicyDownload: feat.customizedPolicyDownload ?? false,
                    processingSpeed: feat.processingSpeed || 'Standard',
                    support: feat.support || 'Standard',
                  },
                })
                setPlanMessage({ type: '', text: '' })
                setIsEditPlan(true)
                setShowPlanModal(true)
              }

              return (
                <div key={p._id} className={`plan-card ${p.isActive ? '' : 'plan-card-inactive'}`}>
                  <div className="plan-card-head">
                    <h3 className="plan-card-name">{p.name}</h3>
                    <span className={`status-pill ${p.isActive ? 'status-active' : 'status-inactive'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="plan-card-price-area">
                    <div className="plan-card-price">₹{p.price}</div>
                    <div className="plan-card-duration">
                      {p.durationDays > 0 ? `/ ${p.durationDays} days` : 'Never Expires'}
                    </div>
                  </div>

                  <div className="plan-card-body">
                    <div className="plan-card-section-label">Documents</div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">AI Documents</span>
                      <span className="plan-card-feature-value">{feat.aiDocuments ?? 0}</span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Manual Documents</span>
                      <span className="plan-card-feature-value">{feat.manualDocuments ?? 0}</span>
                    </div>

                    <div className="plan-card-section-label">Access</div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Desktop App</span>
                      <span className={feat.desktopAccess ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.desktopAccess ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Mobile App</span>
                      <span className={feat.mobileAppAccess ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.mobileAppAccess ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Excel Download</span>
                      <span className={feat.excelDownload ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.excelDownload ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Custom Policy Download</span>
                      <span className={feat.customizedPolicyDownload ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.customizedPolicyDownload ? '✓' : '✗'}
                      </span>
                    </div>

                    <div className="plan-card-section-label">Limits</div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Client Limit</span>
                      <span className="plan-card-feature-value">
                        {feat.clientLimit === 0 ? 'Unlimited' : feat.clientLimit ?? 0}
                      </span>
                    </div>

                    <div className="plan-card-section-label">Service</div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Processing Speed</span>
                      <span className="plan-card-feature-value">{feat.processingSpeed || 'Standard'}</span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">Support</span>
                      <span className="plan-card-feature-value">{feat.support || 'Standard'}</span>
                    </div>

                    <div className="plan-card-section-label">Notifications</div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">WhatsApp Renewal</span>
                      <span className={feat.whatsappRenewal ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.whatsappRenewal ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="plan-card-feature">
                      <span className="plan-card-feature-label">App Notification</span>
                      <span className={feat.appNotificationRenewal ? 'plan-card-feature-check' : 'plan-card-feature-cross'}>
                        {feat.appNotificationRenewal ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  <div className="plan-card-foot">
                    <button type="button" className="secondary-btn table-btn" style={{ width: '100%' }} onClick={openEdit}>
                      Edit Plan
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {showPlanModal ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Subscription Plan</p>
                <h2>{isEditPlan ? 'Edit Plan' : 'Add Plan'}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowPlanModal(false)}>x</button>
            </div>
            <form className="user-form" onSubmit={async (e) => {
              e.preventDefault()
              if (!planForm.name.trim()) {
                setPlanMessage({ type: 'error', text: 'Plan name is required' })
                return
              }
              try {
                setPlanSaving(true)
                const payload = {
                  name: planForm.name.trim(),
                  price: Number(planForm.price) || 0,
                  durationDays: Number(planForm.durationDays) || 0,
                  sortOrder: Number(planForm.sortOrder) || 0,
                  features: { ...planForm.features },
                }
                if (isEditPlan) {
                  await apiFetch(`/api/subscription-plans/${planForm._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  })
                } else {
                  await apiFetch('/api/subscription-plans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  })
                }
                setShowPlanModal(false)
                fetchPlans()
              } catch (error) {
                setPlanMessage({ type: 'error', text: error.message || 'Failed to save plan' })
              } finally {
                setPlanSaving(false)
              }
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  <span>Plan Name</span>
                  <input value={planForm.name} onChange={(e) => setPlanForm(p => ({ ...p, name: e.target.value }))} />
                </label>
                <label>
                  <span>Price (₹)</span>
                  <input type="number" value={planForm.price} onChange={(e) => setPlanForm(p => ({ ...p, price: e.target.value }))} />
                </label>
                <label>
                  <span>Duration (Days, 0 = Never Expires)</span>
                  <input type="number" min="0" value={planForm.durationDays} onChange={(e) => setPlanForm(p => ({ ...p, durationDays: e.target.value }))} />
                </label>
                <label>
                  <span>Sort Order</span>
                  <input type="number" value={planForm.sortOrder} onChange={(e) => setPlanForm(p => ({ ...p, sortOrder: e.target.value }))} />
                </label>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <p className="eyebrow" style={{ margin: '0', color: '#64748b' }}>Features</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  <span>AI Documents</span>
                  <input type="number" value={planForm.features.aiDocuments} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, aiDocuments: Number(e.target.value) || 0 } }))} />
                </label>
                <label>
                  <span>Manual Documents</span>
                  <input type="number" value={planForm.features.manualDocuments} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, manualDocuments: Number(e.target.value) || 0 } }))} />
                </label>
                <label>
                  <span>Client Limit (0 = Unlimited)</span>
                  <input type="number" value={planForm.features.clientLimit} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, clientLimit: Number(e.target.value) || 0 } }))} />
                </label>
                <label>
                  <span>Processing Speed</span>
                  <select value={planForm.features.processingSpeed} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, processingSpeed: e.target.value } }))}
                    style={{ height: '42px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    <option>Standard</option>
                    <option>Fast</option>
                    <option>Accelerated</option>
                    <option>Highest</option>
                  </select>
                </label>
                <label>
                  <span>Support</span>
                  <select value={planForm.features.support} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, support: e.target.value } }))}
                    style={{ height: '42px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', padding: '0 14px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    <option>Standard</option>
                    <option>Priority</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'desktopAccess', label: 'Desktop Access' },
                  { key: 'mobileAppAccess', label: 'Mobile App Access' },
                  { key: 'excelDownload', label: 'Excel Download' },
                  { key: 'appNotificationRenewal', label: 'App Notification Renewal' },
                  { key: 'whatsappRenewal', label: 'WhatsApp Renewal' },
                  { key: 'customizedPolicyDownload', label: 'Customized Policy Download' },
                ].map(({ key, label }) => (
                  <label key={key} className="toggle-row" style={{ padding: '8px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>{label}</span>
                    <input type="checkbox" checked={planForm.features[key]} onChange={(e) => setPlanForm(p => ({ ...p, features: { ...p.features, [key]: e.target.checked } }))} />
                  </label>
                ))}
              </div>

              {planMessage.text ? (
                <div className={`message ${planMessage.type === 'error' ? 'message-error' : 'message-success'}`}>{planMessage.text}</div>
              ) : null}

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={planSaving}>
                  {planSaving ? 'Saving...' : isEditPlan ? 'Save Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default PlansPage
