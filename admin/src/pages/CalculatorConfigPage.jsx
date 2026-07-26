import { useState, useEffect } from 'react'

const VEHICLE_TYPES = [
  { id: 'private_car', label: 'Private Car' },
  { id: 'two_wheeler', label: 'Two Wheeler' },
  { id: 'gcv', label: 'GCV (Goods)' },
  { id: 'gcv_3w', label: 'GCV 3-Wheeler' },
  { id: 'taxi', label: 'Taxi (4W PCV)' },
  { id: 'pcv', label: 'PCV Bus' },
  { id: 'pcv_3w', label: 'PCV 3-Wheeler' },
  { id: 'misc_d', label: 'Misc D (Tractor)' },
]

const AGE_LABELS = {
  upto_5: '1 – 5 Years',
  '5_to_7': '6 – 7 Years',
  above_7: 'Above 7 Years'
}

export default function CalculatorConfigPage({ apiFetch }) {
  const [activeTab, setActiveTab] = useState('private_car')
  const [configs, setConfigs] = useState({})
  const [currentConfig, setCurrentConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)
  const [newField, setNewField] = useState({
    id: '',
    label: '',
    fieldType: 'percent_of_od',
    rate: 0,
    section: 'addon',
    applyToVehicles: [],
  })

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/calculator/config')
      if (res.success) {
        setConfigs(res.configs || {})
        if (res.configs[activeTab]) {
          setCurrentConfig(JSON.parse(JSON.stringify(res.configs[activeTab])))
        }
      }
    } catch (err) {
      console.error('Failed to fetch calculator configs:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to load configurations' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    if (configs[activeTab]) {
      setCurrentConfig(JSON.parse(JSON.stringify(configs[activeTab])))
    } else {
      setCurrentConfig(null)
    }
    setMessage({ type: '', text: '' })
  }, [activeTab, configs])

  const handleSaveConfig = async () => {
    if (!currentConfig) return
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      const res = await apiFetch(`/api/calculator/config/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig),
      })
      if (res.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
        fetchConfigs()
      } else {
        throw new Error(res.message || 'Failed to save configuration')
      }
    } catch (err) {
      console.error('Save error:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCustomField = async (e) => {
    e.preventDefault()
    if (!newField.id || !newField.label) {
      alert('Field ID and Label are required!')
      return
    }
    try {
      setSaving(true)
      const res = await apiFetch('/api/calculator/custom-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newField),
      })
      if (res.success) {
        setShowAddFieldModal(false)
        setNewField({
          id: '',
          label: '',
          fieldType: 'percent_of_od',
          rate: 0,
          section: 'addon',
          applyToVehicles: [],
        })
        setMessage({ type: 'success', text: 'Custom field added successfully!' })
        fetchConfigs()
      }
    } catch (err) {
      alert(err.message || 'Failed to add custom field')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCustomField = async (fieldId) => {
    if (!confirm(`Are you sure you want to delete custom field "${fieldId}"?`)) return
    try {
      const res = await apiFetch(`/api/calculator/custom-field/${fieldId}`, {
        method: 'DELETE',
      })
      if (res.success) {
        setMessage({ type: 'success', text: 'Custom field deleted successfully!' })
        fetchConfigs()
      }
    } catch (err) {
      alert(err.message || 'Failed to delete custom field')
    }
  }

  // Update helper for array-based TP rates
  const updateTpRateArray = (key, index, value) => {
    const tp = { ...currentConfig.tpRates }
    const arr = [...(tp[key] || [])]
    arr[index] = Number(value)
    tp[key] = arr
    setCurrentConfig({ ...currentConfig, tpRates: tp })
  }

  // Update helper for OD rates
  const updateOdRate = (ageKey, zoneKey, value, bracketIdx = null) => {
    const od = JSON.parse(JSON.stringify(currentConfig.odRates || {}))
    if (!od[ageKey]) od[ageKey] = {}
    
    if (bracketIdx !== null) {
      if (!Array.isArray(od[ageKey][zoneKey])) od[ageKey][zoneKey] = []
      od[ageKey][zoneKey][bracketIdx] = Number(value)
    } else {
      od[ageKey][zoneKey] = Number(value)
    }
    
    setCurrentConfig({ ...currentConfig, odRates: od })
  }

  if (loading) {
    return <div className="empty-state">Loading Calculator Control Panel...</div>
  }

  return (
    <div className="panel-grid">
      <section className="panel panel-full">
        <div className="panel-header panel-header-row">
          <div>
            <h2>Premium Calculator Control Center</h2>
            <p className="section-text">Manage Third Party (TP) rates, Own Damage (OD) rates, GST rates, IMT 23 rate, and custom fields dynamically from here.</p>
          </div>
          <div className="toolbar">
            <button type="button" className="secondary-btn" onClick={fetchConfigs}>Refresh</button>
            <button type="button" className="primary-btn small-btn" onClick={() => setShowAddFieldModal(true)}>+ Add Custom Field</button>
            <button type="button" className="primary-btn small-btn" onClick={handleSaveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Current Config'}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`} style={{ margin: '12px 0' }}>
            {message.text}
          </div>
        )}

        {/* Vehicle Type Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          {VEHICLE_TYPES.map(vt => (
            <button
              key={vt.id}
              type="button"
              className={activeTab === vt.id ? 'primary-btn small-btn' : 'secondary-btn'}
              onClick={() => setActiveTab(vt.id)}
            >
              {vt.label}
            </button>
          ))}
        </div>

        {currentConfig ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Tax & Global Settings */}
            <div className="whatsapp-card" style={{ padding: '16px' }}>
              <h3>GST & General Rates Settings ({currentConfig.label})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                <label>
                  <span>GST Rate for OD (%)</span>
                  <input
                    type="number"
                    value={currentConfig.gstRate ?? 18}
                    onChange={e => setCurrentConfig({ ...currentConfig, gstRate: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span>GST Rate for TP (%)</span>
                  <input
                    type="number"
                    value={currentConfig.gstTpRate ?? 18}
                    onChange={e => setCurrentConfig({ ...currentConfig, gstTpRate: Number(e.target.value) })}
                  />
                </label>
                {activeTab === 'gcv' && (
                  <label>
                    <span>Extra Premium per 100kg over 12T (₹)</span>
                    <input
                      type="number"
                      value={currentConfig.extraRates?.extraPer100kg ?? 27}
                      onChange={e => setCurrentConfig({
                        ...currentConfig,
                        extraRates: { ...currentConfig.extraRates, extraPer100kg: Number(e.target.value) }
                      })}
                    />
                  </label>
                )}
              </div>
            </div>


            {/* 2. THIRD PARTY (TP) RATES TABLES */}
            <div className="whatsapp-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3>Third Party (TP) Tariff Rates Tables</h3>
                  <p className="section-text">Edit mandatory Third Party rates separated by fuel engine capacity (CC / GVW) and Electric power (KW).</p>
                </div>
              </div>

              {/* Private Car TP Tables */}
              {activeTab === 'private_car' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '8px 0', color: '#1e293b' }}>⛽ Petrol / Diesel / CNG Third Party Rates (by Engine CC)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Policy Term</th>
                            <th>≤1000 CC (₹)</th>
                            <th>1001–1500 CC (₹)</th>
                            <th>&gt;1500 CC (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>1-Year TP Rate</strong></td>
                            {(currentConfig.tpRates?.tpByCC || [2094, 3416, 7897]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpByCC', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>3-Year TP Rate</strong></td>
                            {(currentConfig.tpRates?.tp3YrsByCC || [6521, 10640, 24596]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tp3YrsByCC', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '8px 0', color: '#0284c7' }}>⚡ Electric Vehicle (EV) Third Party Rates (by KW Power)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Policy Term</th>
                            <th>≤30 KW (₹)</th>
                            <th>30–65 KW (₹)</th>
                            <th>&gt;65 KW (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>1-Year Electric TP Rate</strong></td>
                            {(currentConfig.tpRates?.electricTP1yr || [1780, 2904, 6712]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTP1yr', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>3-Year Electric TP Rate</strong></td>
                            {(currentConfig.tpRates?.electricTP3yr || [5543, 9044, 20907]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTP3yr', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Wheeler TP Tables */}
              {activeTab === 'two_wheeler' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '8px 0', color: '#1e293b' }}>⛽ Petrol / Diesel Third Party Rates (by Engine CC)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Policy Term</th>
                            <th>≤75 CC (₹)</th>
                            <th>76–150 CC (₹)</th>
                            <th>151–350 CC (₹)</th>
                            <th>&gt;350 CC (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>1-Year Petrol TP</strong></td>
                            {(currentConfig.tpRates?.tpByCC || [538, 714, 1366, 2804]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpByCC', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>5-Year Bundle Petrol TP</strong></td>
                            {(currentConfig.tpRates?.tpBundle5yr || [2901, 3851, 7365, 15117]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpBundle5yr', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '8px 0', color: '#0284c7' }}>⚡ Electric Vehicle (EV) Third Party Rates (by KW Power)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Policy Term</th>
                            <th>≤3 KW (₹)</th>
                            <th>3–7 KW (₹)</th>
                            <th>7–16 KW (₹)</th>
                            <th>&gt;16 KW (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>1-Year Electric TP</strong></td>
                            {(currentConfig.tpRates?.electricTP1yr || [457, 607, 1161, 2383]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTP1yr', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>5-Year Electric TP</strong></td>
                            {(currentConfig.tpRates?.electricTP5yr || [2466, 3273, 6260, 12849]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTP5yr', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* GCV TP Tables */}
              {activeTab === 'gcv' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '8px 0', color: '#1e293b' }}>🚛 Standard Fuel GCV Third Party Rates (by GVW Weight)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Vehicle Type</th>
                            <th>≤7.5 Tonnes (₹)</th>
                            <th>7.5T – 12 Tonnes (₹)</th>
                            <th>12T – 20 Tonnes (₹)</th>
                            <th>20T – 40 Tonnes (₹)</th>
                            <th>&gt;40 Tonnes (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Standard GCV TP</strong></td>
                            {(currentConfig.tpRates?.tpByGVW || [16049, 27186, 35313, 43950, 44242]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpByGVW', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '8px 0', color: '#0284c7' }}>⚡ Electric GCV Third Party Rates (by GVW Weight)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Vehicle Type</th>
                            <th>≤7.5 Tonnes (₹)</th>
                            <th>7.5T – 12 Tonnes (₹)</th>
                            <th>12T – 20 Tonnes (₹)</th>
                            <th>20T – 40 Tonnes (₹)</th>
                            <th>&gt;40 Tonnes (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Electric GCV TP</strong></td>
                            {(currentConfig.tpRates?.electricTpByGVW || [13642, 23108, 30016, 37357, 37606]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTpByGVW', idx, e.target.value)}
                                  style={{ width: '110px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Taxi TP Tables */}
              {activeTab === 'taxi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '8px 0', color: '#1e293b' }}>🚕 Petrol / Diesel / CNG Taxi Third Party Rates (by Engine CC)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Tariff Element</th>
                            <th>≤1000 CC (₹)</th>
                            <th>1001–1500 CC (₹)</th>
                            <th>&gt;1500 CC (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Base TP Rate</strong></td>
                            {(currentConfig.tpRates?.tpByCC || [6040, 7940, 10523]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpByCC', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>Per Passenger TP Rate</strong></td>
                            {(currentConfig.tpRates?.tpPerPsgr || [1162, 978, 1117]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('tpPerPsgr', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '8px 0', color: '#0284c7' }}>⚡ Electric Taxi Third Party Rates (by KW Power)</h4>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Tariff Element</th>
                            <th>≤30 KW (₹)</th>
                            <th>30–65 KW (₹)</th>
                            <th>&gt;65 KW (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Base Electric TP Rate</strong></td>
                            {(currentConfig.tpRates?.electricTP || [5134, 6749, 8945]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTP', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>Per Passenger Electric TP Rate</strong></td>
                            {(currentConfig.tpRates?.electricTPPerPsgr || [988, 831, 949]).map((val, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={e => updateTpRateArray('electricTPPerPsgr', idx, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtypes table for GCV 3W, PCV, PCV 3W, Misc D */}
              {['gcv_3w', 'pcv', 'pcv_3w', 'misc_d'].includes(activeTab) && currentConfig.subtypes && (
                <div className="table-wrap" style={{ marginTop: '12px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Subtype Code</th>
                        <th>Subtype Name</th>
                        <th>Base TP Premium (₹)</th>
                        <th>TP Per Passenger Rate (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentConfig.subtypes.map((st, idx) => (
                        <tr key={st.id || idx}>
                          <td><code>{st.id}</code></td>
                          <td>
                            <input
                              type="text"
                              value={st.label}
                              onChange={e => {
                                const updated = [...currentConfig.subtypes]
                                updated[idx].label = e.target.value
                                setCurrentConfig({ ...currentConfig, subtypes: updated })
                              }}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={st.tpBase ?? st.tp ?? 0}
                              onChange={e => {
                                const updated = [...currentConfig.subtypes]
                                if (updated[idx].tpBase !== undefined) updated[idx].tpBase = Number(e.target.value)
                                else updated[idx].tp = Number(e.target.value)
                                setCurrentConfig({ ...currentConfig, subtypes: updated })
                              }}
                              style={{ width: '120px' }}
                            />
                          </td>
                          <td>
                            {st.tpPerPsgr !== undefined ? (
                              <input
                                type="number"
                                value={st.tpPerPsgr}
                                onChange={e => {
                                  const updated = [...currentConfig.subtypes]
                                  updated[idx].tpPerPsgr = Number(e.target.value)
                                  setCurrentConfig({ ...currentConfig, subtypes: updated })
                                }}
                                style={{ width: '120px' }}
                              />
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>


            {/* 3. OWN DAMAGE (OD) BASIC RATES TABLE */}
            <div className="whatsapp-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Own Damage (OD) Tariff Basic Rate Matrix</h3>
                  <p className="section-text">Edit basic OD rates (%) structured by vehicle age, RTO Zone, and CC / capacity bracket.</p>
                </div>
              </div>

              <div className="table-wrap" style={{ marginTop: '12px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Vehicle Age Group</th>
                      <th>RTO Zone</th>
                      {(activeTab === 'private_car' || activeTab === 'taxi') && (
                        <>
                          <th>≤1000 CC Rate (%)</th>
                          <th>1001–1500 CC Rate (%)</th>
                          <th>&gt;1500 CC Rate (%)</th>
                        </>
                      )}
                      {activeTab === 'two_wheeler' && (
                        <>
                          <th>≤75 CC Rate (%)</th>
                          <th>76–150 CC Rate (%)</th>
                          <th>&gt;150 CC Rate (%)</th>
                        </>
                      )}
                      {['gcv', 'gcv_3w', 'pcv', 'pcv_3w', 'misc_d'].includes(activeTab) && (
                        <th>Basic OD Rate (%)</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {['upto_5', '5_to_7', 'above_7'].map(ageKey => {
                      const ageData = currentConfig.odRates?.[ageKey] || {}
                      const zones = Object.keys(ageData)
                      return zones.map((zoneKey, zIdx) => {
                        const val = ageData[zoneKey]
                        return (
                          <tr key={`${ageKey}-${zoneKey}`}>
                            {zIdx === 0 && (
                              <td rowSpan={zones.length} style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>
                                {AGE_LABELS[ageKey]}
                              </td>
                            )}
                            <td><strong>Zone {zoneKey}</strong></td>
                            
                            {Array.isArray(val) ? (
                              val.map((rate, bIdx) => (
                                <td key={bIdx}>
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={rate}
                                    onChange={e => updateOdRate(ageKey, zoneKey, e.target.value, bIdx)}
                                    style={{ width: '100px' }}
                                  />
                                </td>
                              ))
                            ) : (
                              <td>
                                <input
                                  type="number"
                                  step="0.001"
                                  value={val}
                                  onChange={e => updateOdRate(ageKey, zoneKey, e.target.value)}
                                  style={{ width: '120px' }}
                                />
                              </td>
                            )}
                          </tr>
                        )
                      })
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Custom Fields / Addons Manager */}
            <div className="whatsapp-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Configured Add-on & Liability Fields ({currentConfig.customFields?.length || 0})</h3>
                <button type="button" className="secondary-btn" onClick={() => setShowAddFieldModal(true)}>+ Add New Field</button>
              </div>

              <div className="table-wrap" style={{ marginTop: '12px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Field ID</th>
                      <th>Label</th>
                      <th>Type</th>
                      <th>Default Rate / Value</th>
                      <th>Section</th>
                      <th>TP Addition (Fixed/%)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConfig.customFields && currentConfig.customFields.length > 0 ? (
                      currentConfig.customFields.map((field, idx) => (
                        <tr key={field.id || idx}>
                          <td><code>{field.id}</code></td>
                          <td>
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => {
                                const updated = [...currentConfig.customFields]
                                updated[idx].label = e.target.value
                                setCurrentConfig({ ...currentConfig, customFields: updated })
                              }}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td>
                            <select
                              value={field.fieldType}
                              onChange={e => {
                                const updated = [...currentConfig.customFields]
                                updated[idx].fieldType = e.target.value
                                setCurrentConfig({ ...currentConfig, customFields: updated })
                              }}
                            >
                              <option value="percent_of_od">% of Basic OD</option>
                              <option value="percent_of_idv">% of IDV</option>
                              <option value="fixed_amount">Fixed Amount (₹)</option>
                            </select>

                          </td>
                          <td>
                            <input
                              type="number"
                              value={field.rate}
                              onChange={e => {
                                const updated = [...currentConfig.customFields]
                                updated[idx].rate = Number(e.target.value)
                                setCurrentConfig({ ...currentConfig, customFields: updated })
                              }}
                              style={{ width: '90px' }}
                            />
                          </td>
                          <td>
                            <select
                              value={field.section}
                              onChange={e => {
                                const updated = [...currentConfig.customFields]
                                updated[idx].section = e.target.value
                                setCurrentConfig({ ...currentConfig, customFields: updated })
                              }}
                            >
                              <option value="od">Own Damage (OD)</option>
                              <option value="addon">Add-on Cover</option>
                              <option value="tp">Third Party (TP)</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={field.hasTpAddition || false}
                                  onChange={e => {
                                    const updated = [...currentConfig.customFields]
                                    updated[idx].hasTpAddition = e.target.checked
                                    setCurrentConfig({ ...currentConfig, customFields: updated })
                                  }}
                                />
                                Add TP?
                              </label>
                              {field.hasTpAddition && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                  <select
                                    value={field.tpType || 'fixed_amount'}
                                    onChange={e => {
                                      const updated = [...currentConfig.customFields]
                                      updated[idx].tpType = e.target.value
                                      setCurrentConfig({ ...currentConfig, customFields: updated })
                                    }}
                                    style={{ fontSize: '11px', padding: '2px' }}
                                  >
                                    <option value="fixed_amount">₹</option>
                                    <option value="percent_of_tp">%</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={field.tpRate || 0}
                                    onChange={e => {
                                      const updated = [...currentConfig.customFields]
                                      updated[idx].tpRate = Number(e.target.value)
                                      setCurrentConfig({ ...currentConfig, customFields: updated })
                                    }}
                                    style={{ width: '60px', fontSize: '12px' }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <label className="toggle-row" style={{ margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={field.isActive}
                                onChange={e => {
                                  const updated = [...currentConfig.customFields]
                                  updated[idx].isActive = e.target.checked
                                  setCurrentConfig({ ...currentConfig, customFields: updated })
                                }}
                              />
                            </label>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary-btn table-btn"
                              style={{ color: '#ef4444' }}
                              onClick={() => handleDeleteCustomField(field.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '16px' }}>No custom fields added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="empty-state">No configuration found for this vehicle type.</div>
        )}
      </section>

      {/* Add Custom Field Modal */}
      {showAddFieldModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="eyebrow">New Calculator Field</p>
                <h2>Add Custom Calculator Field</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowAddFieldModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCustomField} className="user-form">
              <label>
                <span>Field Key (ID)</span>
                <input
                  placeholder="e.g. cngkit or engine_protect"
                  value={newField.id}
                  onChange={e => setNewField({ ...newField, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  required
                />
              </label>

              <label>
                <span>Display Label</span>
                <input
                  placeholder="e.g. CNG / Bi-Fuel Kit Cover"
                  value={newField.label}
                  onChange={e => setNewField({ ...newField, label: e.target.value })}
                  required
                />
              </label>

              <label>
                <span>OD / Main Calculation Type</span>
                <select
                  value={newField.fieldType}
                  onChange={e => setNewField({ ...newField, fieldType: e.target.value })}
                >
                  <option value="percent_of_od">% of Basic OD</option>
                  <option value="percent_of_idv">% of IDV</option>
                  <option value="fixed_amount">Fixed Amount (₹)</option>
                </select>
              </label>

              <label>
                <span>OD Default Rate / Amount</span>
                <input
                  type="number"
                  placeholder="e.g. 4 for 4% or 250 for ₹250"
                  value={newField.rate}
                  onChange={e => setNewField({ ...newField, rate: Number(e.target.value) })}
                />
              </label>

              <label>
                <span>Calculator Section</span>
                <select
                  value={newField.section}
                  onChange={e => setNewField({ ...newField, section: e.target.value })}
                >
                  <option value="od">Own Damage Section</option>
                  <option value="addon">Add-ons Section</option>
                  <option value="tp">Liability / Third Party Section</option>
                </select>
              </label>

              {/* TP Addition Settings */}
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginTop: '6px', border: '1px solid #e2e8f0' }}>
                <label className="toggle-row" style={{ margin: 0, fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={newField.hasTpAddition || false}
                    onChange={e => setNewField({ ...newField, hasTpAddition: e.target.checked })}
                  />
                  <span style={{ fontSize: '13px' }}>Also Add Third Party (TP) Premium when Enabled?</span>
                </label>

                {newField.hasTpAddition && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <label>
                      <span>TP Addition Type</span>
                      <select
                        value={newField.tpType || 'fixed_amount'}
                        onChange={e => setNewField({ ...newField, tpType: e.target.value })}
                      >
                        <option value="fixed_amount">Fixed Amount (₹) (e.g. ₹60)</option>
                        <option value="percent_of_tp">% of TP Premium</option>
                      </select>
                    </label>

                    <label>
                      <span>TP Rate / Amount</span>
                      <input
                        type="number"
                        placeholder="e.g. 60 for ₹60"
                        value={newField.tpRate || 0}
                        onChange={e => setNewField({ ...newField, tpRate: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="secondary-btn" onClick={() => setShowAddFieldModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Adding...' : 'Add Field'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
