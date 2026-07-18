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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>AI Docs</th>
                  <th>Manual Docs</th>
                  <th>Clients</th>
                  <th>Desktop</th>
                  <th>Mobile</th>
                  <th>Excel</th>
                  <th>WhatsApp</th>
                  <th>Speed</th>
                  <th>Support</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, i) => (
                  <tr key={p._id} style={p.isActive ? {} : { opacity: 0.5 }}>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.durationDays}d</td>
                    <td>{p.features?.aiDocuments ?? 0}</td>
                    <td>{p.features?.manualDocuments ?? 0}</td>
                    <td>{p.features?.clientLimit === 0 ? 'Unlimited' : p.features?.clientLimit ?? 0}</td>
                    <td>{p.features?.desktopAccess ? 'Yes' : 'No'}</td>
                    <td>{p.features?.mobileAppAccess ? 'Yes' : 'No'}</td>
                    <td>{p.features?.excelDownload ? 'Yes' : 'No'}</td>
                    <td>{p.features?.whatsappRenewal ? 'Yes' : 'No'}</td>
                    <td>{p.features?.processingSpeed || 'Standard'}</td>
                    <td>{p.features?.support || 'Standard'}</td>
                    <td>
                      <span className={`status-pill ${p.isActive ? 'status-active' : 'status-inactive'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="secondary-btn table-btn" onClick={() => {
                          setPlanForm({
                            _id: p._id,
                            name: p.name,
                            price: String(p.price),
                            durationDays: String(p.durationDays),
                            sortOrder: p.sortOrder || 0,
                            features: {
                              aiDocuments: p.features?.aiDocuments ?? 0,
                              manualDocuments: p.features?.manualDocuments ?? 0,
                              desktopAccess: p.features?.desktopAccess ?? false,
                              mobileAppAccess: p.features?.mobileAppAccess ?? false,
                              excelDownload: p.features?.excelDownload ?? false,
                              clientLimit: p.features?.clientLimit ?? 0,
                              appNotificationRenewal: p.features?.appNotificationRenewal ?? false,
                              whatsappRenewal: p.features?.whatsappRenewal ?? false,
                              customizedPolicyDownload: p.features?.customizedPolicyDownload ?? false,
                              processingSpeed: p.features?.processingSpeed || 'Standard',
                              support: p.features?.support || 'Standard',
                            },
                          })
                          setPlanMessage({ type: '', text: '' })
                          setIsEditPlan(true)
                          setShowPlanModal(true)
                        }}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  durationDays: Number(planForm.durationDays) || 30,
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
                  <span>Duration (Days)</span>
                  <input type="number" value={planForm.durationDays} onChange={(e) => setPlanForm(p => ({ ...p, durationDays: e.target.value }))} />
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
