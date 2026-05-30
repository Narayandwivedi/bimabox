import { useState, useEffect } from 'react'

const IDVInput = ({ idv, setIdv }) => (
  <div>
    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>IDV – Insured Declared Value (₹)</label>
    <input
      type='number'
      value={idv}
      onChange={e => setIdv(e.target.value)}
      placeholder='e.g. 500000'
      className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300'
    />
  </div>
)

// ─── IMT TARIFF DATA (WEF 1st June 2022) ───────────────────────────────────
const TARIFF = {
  private_car: {
    // CC brackets: 0=<1000, 1=1001-1500, 2=>1500
    tpByCC: [2094, 3416, 7897],
    tp3YrsByCC: [5543, 9044, 20907],
    odRates: {
      upto_5: { A: [3.127, 3.283, 3.440], B: [3.039, 3.191, 3.343] },
      '5_to_7': { A: [3.283, 3.447, 3.612], B: [3.191, 3.351, 3.510] },
      above_7: { A: [3.362, 3.529, 3.698], B: [3.267, 3.430, 3.596] },
    },
    // Electric: KW brackets: 0=<30KW, 1=30-65KW, 2=>65KW
    electricTP1yr: [1780, 2904, 6712],
    electricTP3yr: [5543, 9044, 20907],
  },
  two_wheeler: {
    // CC brackets: 0=<=75, 1=76-150, 2=151-350, 3=>350
    tpByCC: [538, 714, 1366, 2804],
    tpLongTerm: [6521, 10640, 24596, null],
    // OD bracket: 0=<=150CC, 1=151-350CC, 2=>350CC
    odRates: {
      upto_5: { A: [1.708, 1.793, 1.879], B: [1.676, 1.760, 1.844] },
      '5_to_7': { A: [1.793, 1.883, 1.973], B: [1.760, 1.848, 1.936] },
      above_7: { A: [1.836, 1.928, 2.020], B: [1.802, 1.892, 1.982] },
    },
    // Electric: KW brackets: 0=<3KW, 1=3-7KW, 2=7-16KW, 3=>16KW
    electricTP1yr: [457, 607, 1161, 2383],
    electricTP5yr: [2466, 3273, 6260, 12849],
  },
  gcv: {
    // GVW brackets (kg): <=7500, 7501-12000, 12001-20000, 20001-40000, >40001
    tpByGVW: [16049, 27186, 35313, 43950, 44242],
    // Extra TP for GVW > 12000kg: Rs 27 per 100 kg above 12000
    extraPer100kg: 27,
    // Zone A, B, C - Age groups
    odRates: {
      upto_5: { A: 1.751, B: 1.743, C: 1.726 },
      '5_to_7': { A: 1.795, B: 1.787, C: 1.770 },
      above_7: { A: 1.839, B: 1.830, C: 1.812 },
    },
  },
  gcv_3w: {
    // Sub-types: public A2, e-rick GCV, private A3, e-rick private
    subtypes: [
      { id: 'public', label: '3W GCV Public (A2)', tp: 4492 },
      { id: 'erickshaw_gcv', label: '3W e-Rickshaw GCV', tp: 3139 },
      { id: 'private', label: '3Wh GCV Private (A3)', tp: 3922 },
      { id: 'erickshaw_private', label: '3Wh e-Rickshaw Private', tp: 3211 },
    ],
    odRates: {
      upto_5: { A: 1.751, B: 1.743, C: 1.726 },
      '5_to_7': { A: 1.795, B: 1.787, C: 1.770 },
      above_7: { A: 1.839, B: 1.830, C: 1.812 },
    },
  },
  taxi: {
    // CC brackets: 0=<1000, 1=1001-1500, 2=>1500
    tpByCC: [6040, 7940, 10523],
    tpPerPsgr: [1162, 978, 1117],
    odRates: {
      upto_5: { A: [3.284, 3.448, 3.612], B: [3.191, 3.351, 3.510] },
      '5_to_7': { A: [3.366, 3.534, 3.703], B: [3.271, 3.435, 3.598] },
      above_7: { A: [3.448, 3.620, 3.793], B: [3.351, 3.519, 3.686] },
    },
    // Electric taxi KW brackets: <30KW, 30-65KW, >65KW
    electricTP: [5134, 6749, 8945],
    electricTPPerPsgr: [988, 831, 949],
  },
  pcv: {
    // BUS & MAXI >= 4W & >6 Psgr (C2)
    subtypes: [
      { id: 'school_bus', label: 'School Bus', tpBase: 12192, tpPerPsgr: 745, isElectric: false },
      { id: 'other_bus', label: 'Other Bus / Maxi', tpBase: 14343, tpPerPsgr: 877, isElectric: false },
      { id: 'e_school_bus', label: 'E-School Bus', tpBase: 10363, tpPerPsgr: 633, isElectric: true },
      { id: 'e_other_bus', label: 'E-Bus / Maxi', tpBase: 12192, tpPerPsgr: 745, isElectric: true },
    ],
    odRates: {
      upto_5: { A: 1.680, B: 1.672, C: 1.656 },
      '5_to_7': { A: 1.722, B: 1.714, C: 1.697 },
      above_7: { A: 1.764, B: 1.756, C: 1.739 },
    },
    // Additional OD for passengers
    addOD: [
      { maxPsgr: 18, extra: 350 },
      { maxPsgr: 36, extra: 450 },
      { maxPsgr: 60, extra: 550 },
      { maxPsgr: Infinity, extra: 680 },
    ],
  },
  pcv_3w: {
    subtypes: [
      { id: 'c1b', label: '3W PCV ≤6 Psgr (C1 B)', tpBase: 2539, tpPerPsgr: 1214 },
      { id: 'erickshaw_c1b', label: '3W e-Rick PCV ≤6 Psgr', tpBase: 1648, tpPerPsgr: 789 },
      { id: 'c3a', label: '3WH PCV >6 & <17 Psgr (C3 A)', tpBase: 6763, tpPerPsgr: 1349 },
      { id: 'erickshaw_c3a', label: '3W e-Rick PCV >6 Psgr', tpBase: 5749, tpPerPsgr: 1147 },
    ],
    odRates: {
      upto_5: { A: 1.680, B: 1.672, C: 1.656 },
      '5_to_7': { A: 1.722, B: 1.714, C: 1.697 },
      above_7: { A: 1.764, B: 1.756, C: 1.739 },
    },
  },
  misc_d: {
    odRate: 1.05,
    subtypes: [
      { id: 'agri_tractor', label: 'Agricultural Tractor', tp: 3268 },
      { id: 'mobile_crane', label: 'Mobile Crane / Road Roller', tp: 20879 },
      { id: 'excavator', label: 'Excavator / Dozer / Dumper', tp: 20879 },
      { id: 'forklift', label: 'Forklift / Reach Stacker', tp: 7897 },
      { id: 'other_misc', label: 'Other Misc-D Vehicle', tp: 7897 },
    ],
  },
}

// ─── VEHICLE CATEGORIES ─────────────────────────────────────────────────────
const VEHICLE_CATEGORIES = [
  { id: 'private_car', label: 'Private Car', icon: '🚗', desc: 'Personal 4-Wheeler', gradient: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { id: 'two_wheeler', label: '2W / Motorcycle', icon: '🏍️', desc: 'Scooter & Motorcycle', gradient: 'from-purple-500 to-violet-600', light: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { id: 'gcv', label: 'GCV', icon: '🚛', desc: 'Goods Carrying Vehicle', gradient: 'from-orange-500 to-amber-600', light: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { id: 'gcv_3w', label: '3W GCV', icon: '🛺', desc: '3-Wheeler Goods Vehicle', gradient: 'from-yellow-500 to-orange-500', light: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400' },
  { id: 'pcv', label: 'BUS & MAXI (C2)', icon: '🚌', desc: '≥4W & >6 Passengers', gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 border-green-200 hover:border-green-400' },
  { id: 'pcv_3w', label: '3W PCV', icon: '🛺', desc: '3-Wheeler Passenger Vehicle', gradient: 'from-teal-500 to-cyan-600', light: 'bg-teal-50 border-teal-200 hover:border-teal-400' },
  { id: 'taxi', label: 'Taxi (C1 A)', icon: '🚕', desc: '4W ≤6 Passengers', gradient: 'from-red-500 to-rose-600', light: 'bg-red-50 border-red-200 hover:border-red-400' },
  { id: 'misc_d', label: 'Misc-D Special', icon: '🚜', desc: 'Special Vehicles & Tractors', gradient: 'from-slate-500 to-gray-600', light: 'bg-slate-50 border-slate-200 hover:border-slate-400' },
]

// ─── HELPER ─────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(n).toLocaleString('en-IN')
// Exact 2-decimal formatter for breakup lines (always shows paise)
const fmtD = (n) => {
  const num = typeof n === 'number' ? n : parseFloat(n) || 0
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getCCBracket = (cc) => {
  if (cc <= 1000) return 0
  if (cc <= 1500) return 1
  return 2
}
const get2WCCBracket = (cc) => {
  if (cc <= 75) return 0
  if (cc <= 150) return 1
  if (cc <= 350) return 2
  return 3
}
const get2WODBracket = (cc) => {
  if (cc <= 150) return 0
  if (cc <= 350) return 1
  return 2
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const PremiumCalculator = () => {
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState(null)
  const [result, setResult] = useState(null)

  // Common fields
  const [zone, setZone] = useState('A')
  const [vehicleAge, setVehicleAge] = useState('upto_5')
  const [idv, setIdv] = useState('')
  const [ncb, setNcb] = useState(0)
  const [coverageType, setCoverageType] = useState('comprehensive') // kept for other vehicle classes
  const [policyType, setPolicyType] = useState('comprehensive') // 'od' | 'tp' | 'comprehensive' | 'bundle'
  const [gstEnabled, setGstEnabled] = useState(true)
  const [odDiscount, setOdDiscount] = useState(0)

  // Vehicle-specific
  const [cc, setCc] = useState('')             // Private Car / Taxi / 2W
  const [kwPower, setKwPower] = useState('')   // Electric vehicles KW
  const [isElectric, setIsElectric] = useState(false)
  const [gvw, setGvw] = useState('')           // GCV
  const [passengers, setPassengers] = useState('') // PCV/Taxi passengers
  const [subtype, setSubtype] = useState('')   // For 3W, PCV, Misc-D sub-types
  const [policyTerm, setPolicyTerm] = useState('1yr') // 1yr / 5yr for 2W

  const selectedCategory = VEHICLE_CATEGORIES.find(v => v.id === vehicleType)

  const resetForm = () => {
    setResult(null)
    setCc('')
    setKwPower('')
    setIsElectric(false)
    setGvw('')
    setPassengers('')
    setSubtype('')
    setIdv('')
    setNcb(0)
    setZone('A')
    setVehicleAge('upto_5')
    setCoverageType('comprehensive')
    setPolicyType('comprehensive')
    setGstEnabled(true)
    setOdDiscount(0)
    setPolicyTerm('1yr')
  }

  const handleVehicleSelect = (id) => {
    setVehicleType(id)
    resetForm()
    // set default subtype
    const defaults = { gcv_3w: 'public', pcv: 'school_bus', pcv_3w: 'c1b', misc_d: 'agri_tractor', taxi: null }
    if (defaults[id] !== undefined) setSubtype(defaults[id] || '')
    setStep(2)
  }

  // ─── CALCULATE ───────────────────────────────────────────────────────────
  const calculatePremium = () => {
    const idvVal = parseFloat(idv) || 0
    const ccVal = parseFloat(cc) || 0
    const gvwVal = parseFloat(gvw) || 0
    const passengerVal = parseInt(passengers) || 1
    const kwVal = parseFloat(kwPower) || 0

    let tpPremium = 0
    let odRate = 0
    let details = {}

    switch (vehicleType) {
      // ── PRIVATE CAR ────────────────────────────────────────────────────
      case 'private_car': {
        if (isElectric) {
          const kwBracket = kwVal < 30 ? 0 : kwVal <= 65 ? 1 : 2
          if (policyType === 'bundle') {
            tpPremium = TARIFF.private_car.electricTP3yr[kwBracket]
          } else {
            tpPremium = TARIFF.private_car.electricTP1yr[kwBracket]
          }
          odRate = TARIFF.private_car.odRates[vehicleAge][zone][kwBracket]
          details = { label: kwVal < 30 ? '<30 KW' : kwVal <= 65 ? '30–65 KW' : '>65 KW', isElec: true }
        } else {
          const bracket = getCCBracket(ccVal)
          if (policyType === 'bundle') {
            tpPremium = TARIFF.private_car.tp3YrsByCC[bracket]
          } else {
            tpPremium = TARIFF.private_car.tpByCC[bracket]
          }
          odRate = TARIFF.private_car.odRates[vehicleAge][zone][bracket]
          details = { label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC' }
        }
        break
      }
      // ── TWO WHEELER ────────────────────────────────────────────────────
      case 'two_wheeler': {
        if (isElectric) {
          const kwBracket = kwVal < 3 ? 0 : kwVal <= 7 ? 1 : kwVal <= 16 ? 2 : 3
          tpPremium = policyTerm === '5yr'
            ? TARIFF.two_wheeler.electricTP5yr[kwBracket]
            : TARIFF.two_wheeler.electricTP1yr[kwBracket]
          odRate = 1.5 // Electric OD rate (approximate)
          details = { label: kwVal < 3 ? '<3 KW' : kwVal <= 7 ? '3–7 KW' : kwVal <= 16 ? '7–16 KW' : '>16 KW', isElec: true }
        } else {
          const ccBracket = get2WCCBracket(ccVal)
          const odBracket = get2WODBracket(ccVal)
          if (policyType === 'bundle') {
            tpPremium = TARIFF.two_wheeler.tpLongTerm[ccBracket] || TARIFF.two_wheeler.tpByCC[ccBracket]
          } else {
            tpPremium = TARIFF.two_wheeler.tpByCC[ccBracket]
          }
          odRate = TARIFF.two_wheeler.odRates[vehicleAge][zone][odBracket]
          details = { label: ccVal <= 75 ? '≤75 CC' : ccVal <= 150 ? '76–150 CC' : ccVal <= 350 ? '151–350 CC' : '>350 CC' }
        }
        break
      }
      // ── GCV ────────────────────────────────────────────────────────────
      case 'gcv': {
        let tpIdx = 0
        if (gvwVal <= 7500) tpIdx = 0
        else if (gvwVal <= 12000) tpIdx = 1
        else if (gvwVal <= 20000) tpIdx = 2
        else if (gvwVal <= 40000) tpIdx = 3
        else tpIdx = 4
        tpPremium = TARIFF.gcv.tpByGVW[tpIdx]
        // Extra for GVW > 12000
        if (gvwVal > 12000) {
          const extra = Math.ceil((gvwVal - 12000) / 100) * TARIFF.gcv.extraPer100kg
          details.extraTP = extra
          tpPremium += extra
        }
        odRate = TARIFF.gcv.odRates[vehicleAge][zone] || TARIFF.gcv.odRates[vehicleAge]['A']
        details = { ...details, label: gvwVal <= 7500 ? '≤7500 Kg' : gvwVal <= 12000 ? '7501–12000 Kg' : gvwVal <= 20000 ? '12001–20000 Kg' : gvwVal <= 40000 ? '20001–40000 Kg' : '>40001 Kg' }
        break
      }
      // ── 3W GCV ─────────────────────────────────────────────────────────
      case 'gcv_3w': {
        const st = TARIFF.gcv_3w.subtypes.find(s => s.id === subtype) || TARIFF.gcv_3w.subtypes[0]
        tpPremium = st.tp
        odRate = TARIFF.gcv_3w.odRates[vehicleAge][zone] || TARIFF.gcv_3w.odRates[vehicleAge]['A']
        details = { label: st.label }
        break
      }
      // ── TAXI ───────────────────────────────────────────────────────────
      case 'taxi': {
        if (isElectric) {
          const kwBracket = kwVal < 30 ? 0 : kwVal <= 65 ? 1 : 2
          tpPremium = TARIFF.taxi.electricTP[kwBracket] + (passengerVal * TARIFF.taxi.electricTPPerPsgr[kwBracket])
          odRate = 3.5 // approximate electric taxi OD
          details = { label: kwVal < 30 ? '<30 KW' : kwVal <= 65 ? '30–65 KW' : '>65 KW', isElec: true, tpBase: TARIFF.taxi.electricTP[kwBracket], tpPsgr: passengerVal * TARIFF.taxi.electricTPPerPsgr[kwBracket] }
        } else {
          const bracket = getCCBracket(ccVal)
          tpPremium = TARIFF.taxi.tpByCC[bracket] + (passengerVal * TARIFF.taxi.tpPerPsgr[bracket])
          odRate = TARIFF.taxi.odRates[vehicleAge][zone][bracket]
          details = { label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC', tpBase: TARIFF.taxi.tpByCC[bracket], tpPsgr: passengerVal * TARIFF.taxi.tpPerPsgr[bracket] }
        }
        break
      }
      // ── BUS & MAXI PCV (C2) ────────────────────────────────────────────
      case 'pcv': {
        const st = TARIFF.pcv.subtypes.find(s => s.id === subtype) || TARIFF.pcv.subtypes[0]
        tpPremium = st.tpBase + (passengerVal * st.tpPerPsgr)
        odRate = TARIFF.pcv.odRates[vehicleAge][zone] || TARIFF.pcv.odRates[vehicleAge]['A']
        const addODEntry = TARIFF.pcv.addOD.find(a => passengerVal <= a.maxPsgr)
        details = { label: st.label, tpBase: st.tpBase, tpPsgr: passengerVal * st.tpPerPsgr, addOD: addODEntry?.extra || 350 }
        break
      }
      // ── 3W PCV ─────────────────────────────────────────────────────────
      case 'pcv_3w': {
        const st = TARIFF.pcv_3w.subtypes.find(s => s.id === subtype) || TARIFF.pcv_3w.subtypes[0]
        tpPremium = st.tpBase + (passengerVal * st.tpPerPsgr)
        odRate = TARIFF.pcv_3w.odRates[vehicleAge][zone] || TARIFF.pcv_3w.odRates[vehicleAge]['A']
        details = { label: st.label, tpBase: st.tpBase, tpPsgr: passengerVal * st.tpPerPsgr }
        break
      }
      // ── MISC-D ─────────────────────────────────────────────────────────
      case 'misc_d': {
        const st = TARIFF.misc_d.subtypes.find(s => s.id === subtype) || TARIFF.misc_d.subtypes[0]
        tpPremium = st.tp
        odRate = TARIFF.misc_d.odRate
        details = { label: st.label }
        break
      }
      default:
        break
    }

    let odPremium = 0
    const odDiscountVal = parseFloat(odDiscount) || 0
    if (vehicleType === 'private_car' || (vehicleType === 'two_wheeler' && !isElectric)) {
      if (policyType !== 'tp' && idvVal > 0) {
        odPremium = idvVal * (odRate / 100)
        odPremium = odPremium * (1 - ncb / 100)
        odPremium = odPremium * (1 - odDiscountVal / 100)
      }
      if (policyType === 'od') {
        tpPremium = 0
      }
    } else {
      if (coverageType === 'comprehensive' && idvVal > 0) {
        odPremium = idvVal * (odRate / 100)
        odPremium = odPremium * (1 - ncb / 100)
        odPremium = odPremium * (1 - odDiscountVal / 100)
      }
      if (coverageType === 'tp') {
        odPremium = 0
      }
    }

    const netPremium = odPremium + tpPremium
    const gst = gstEnabled ? netPremium * 0.18 : 0
    const totalPremium = netPremium + gst

    setResult({
      odPremium,                          // raw – shown exact in breakup
      tpPremium,                          // raw
      gst,                                // raw
      totalPremium: Math.round(totalPremium), // rounded for payable amount
      odRate,
      details,
      odDiscountVal,
    })
  }

  // Auto-calculate premium on state updates
  useEffect(() => {
    if (vehicleType) {
      calculatePremium()
    }
  }, [vehicleType, zone, vehicleAge, idv, ncb, odDiscount, coverageType, policyType, gstEnabled, cc, kwPower, isElectric, gvw, passengers, subtype, policyTerm])

  // ─── ZONE SELECTOR ─────────────────────────────────────────────────────────
  const ZoneSelector = ({ zones = ['A', 'B'] }) => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>RTO Zone</label>
      <div className={`flex gap-1 sm:gap-1.5 rounded-2xl bg-slate-200 p-1`}>
        {zones.map(z => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={`flex-1 rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all ${zone === z ? `bg-white shadow-sm text-indigo-600` : 'text-slate-500'}`}
          >
            Zone {z}
          </button>
        ))}
      </div>
      {zones.includes('A') && (
        <p className='mt-1 text-[8px] sm:text-[9px] text-slate-400 font-medium'>
          Zone A: Ahmedabad, Bengaluru, Hyderabad, Mumbai, Delhi, Pune
        </p>
      )}
    </div>
  )

  // ─── AGE SELECTOR ──────────────────────────────────────────────────────────
  const AgeSelector = () => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Age</label>
      <div className='flex gap-1 rounded-2xl bg-slate-200 p-1'>
        {[['upto_5', '0–5 Yrs'], ['5_to_7', '5–7 Yrs'], ['above_7', '>7 Yrs']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setVehicleAge(val)}
            className={`flex-1 rounded-xl py-2 text-[9px] sm:text-[10px] font-bold transition-all ${vehicleAge === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  // ─── NCB ───────────────────────────────────────────────────────────────────
  const NCBSelector = () => {
    const slabs = [
      { years: 0, pct: 0 },
      { years: 1, pct: 20 },
      { years: 2, pct: 25 },
      { years: 3, pct: 35 },
      { years: 4, pct: 45 },
      { years: 5, pct: 50 },
    ]
    return (
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No Claim Bonus (NCB)</label>
        <div className='grid grid-cols-3 sm:grid-cols-6 gap-1.5'>
          {slabs.map(slab => (
            <button
              key={slab.years}
              onClick={() => setNcb(slab.pct)}
              className={`rounded-xl border py-2 text-[10px] sm:text-xs font-bold transition-all ${ncb === slab.pct ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              {slab.years} Yr ({slab.pct}%)
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── COVERAGE TYPE / POLICY TYPE ───────────────────────────────────────────
  const PolicyTypeSelector = () => {
    const is2W = vehicleType === 'two_wheeler'
    const policies = [
      { id: 'od', label: 'Own Damage (OD)', desc: 'Damages to your own vehicle' },
      { id: 'tp', label: 'Third Party (TP)', desc: 'Mandatory third party liability' },
      { id: 'comprehensive', label: 'Comprehensive', desc: 'Own Damage + Third Party' },
      { id: 'bundle', label: 'Bundle Policy', desc: is2W ? '1-Year OD + 5-Year TP' : '1-Year OD + 3-Year TP' },
    ]
    return (
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Policy Type</label>
        <div className='grid gap-2 grid-cols-2 sm:grid-cols-4'>
          {policies.map(p => (
            <button
              key={p.id}
              onClick={() => setPolicyType(p.id)}
              className={`rounded-2xl border-2 p-3 text-left transition-all ${policyType === p.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <p className='text-[11px] sm:text-xs font-black text-slate-900'>{p.label}</p>
              <p className='mt-0.5 text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight'>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const GSTToggle = () => (
    <div className='flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5'>
      <div>
        <p className='text-xs font-black text-slate-800'>Include GST (18%)</p>
        <p className='text-[9px] text-slate-400 font-medium'>Add 18% Goods and Services Tax to final premium</p>
      </div>
      <button
        onClick={() => setGstEnabled(prev => !prev)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${gstEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${gstEnabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )

  // ─── OD DISCOUNT INPUT ─────────────────────────────────────────────────────
  const ODDiscountInput = () => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>
        OD Discount
        <span className='ml-2 text-orange-500 font-black text-[10px] sm:text-[11px]'>{odDiscount}%</span>
      </label>
      <div className='rounded-2xl border border-slate-200 bg-white p-3 space-y-2'>
        <input
          type='range'
          min={0}
          max={80}
          step={1}
          value={odDiscount}
          onChange={e => setOdDiscount(Number(e.target.value))}
          className='w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500'
        />
        <div className='flex items-center justify-between'>
          <div className='flex gap-1 flex-wrap'>
            {[0, 5, 10, 15, 20, 25, 30].map(v => (
              <button
                key={v}
                type='button'
                onClick={() => setOdDiscount(v)}
                className={`rounded-lg px-2 py-1 text-[9px] sm:text-[10px] font-bold transition-all border ${
                  odDiscount === v
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
          <input
            type='number'
            min={0}
            max={80}
            value={odDiscount}
            onChange={e => setOdDiscount(Math.min(80, Math.max(0, Number(e.target.value))))}
            className='w-14 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-xs font-black text-orange-600 focus:border-orange-400 focus:outline-none'
          />
        </div>
        <p className='text-[8px] text-slate-400 font-medium'>Insurer/channel OD discount applied after NCB • Max 80%</p>
      </div>
    </div>
  )

  const CoverageSelector = () => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Class of Insurance</label>
      <div className='grid gap-2 grid-cols-2'>
        {[['comprehensive', 'Comprehensive', 'OD + Third Party'], ['tp', 'Third Party Only', 'Mandatory Only']].map(([val, title, sub]) => (
          <button
            key={val}
            onClick={() => setCoverageType(val)}
            className={`rounded-2xl border-2 p-3 text-left transition-all ${coverageType === val ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <p className='text-[11px] sm:text-xs font-black text-slate-900'>{title}</p>
            <p className='mt-0.5 text-[9px] sm:text-[10px] text-slate-500 font-medium'>{sub}</p>
          </button>
        ))}
      </div>
    </div>
  )

  // ─── RESULT ────────────────────────────────────────────────────────────────
  const ResultBox = () => {
    if (!result) return null

    const showOD = policyType !== 'tp'
    const showTP = policyType !== 'od'
    const isBundle = policyType === 'bundle'

    const odBase = showOD ? (parseFloat(idv) || 0) * (result.odRate / 100) : 0
    const ncbDiscount = showOD ? odBase * (ncb / 100) : 0
    const afterNcbOD = odBase - ncbDiscount
    const odDiscountAmt = showOD ? afterNcbOD * ((result.odDiscountVal || 0) / 100) : 0

    return (
      <div className='border-t border-slate-200 pt-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <div className='rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3'>
          <h3 className='text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2'>Premium Breakup</h3>

          {showOD && (
            <>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-500'>Insured Declared Value (IDV)</p>
                <p className='font-black text-slate-800'>₹{fmtD(parseFloat(idv) || 0)}</p>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-500'>Selected OD Rate</p>
                <p className='font-black text-slate-800'>{result.odRate}%</p>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-500'>Calculated OD Premium</p>
                <p className='font-black text-slate-800'>₹{fmtD(odBase)}</p>
              </div>
              {ncb > 0 && (
                <>
                  <div className='flex items-center justify-between text-xs text-emerald-600'>
                    <p className='font-bold'>NCB Percentage Discount</p>
                    <p className='font-black'>{ncb}%</p>
                  </div>
                  <div className='flex items-center justify-between text-xs text-emerald-600'>
                    <p className='font-bold'>NCB Discount Amount</p>
                    <p className='font-black'>- ₹{fmtD(ncbDiscount)}</p>
                  </div>
                </>
              )}
              {(result.odDiscountVal || 0) > 0 && (
                <>
                  <div className='flex items-center justify-between text-xs text-orange-600'>
                    <p className='font-bold'>OD Discount</p>
                    <p className='font-black'>{result.odDiscountVal}%</p>
                  </div>
                  <div className='flex items-center justify-between text-xs text-orange-600'>
                    <p className='font-bold'>OD Discount Amount</p>
                    <p className='font-black'>- ₹{fmtD(odDiscountAmt)}</p>
                  </div>
                </>
              )}
              <div className='flex items-center justify-between text-xs border-b border-dashed border-slate-200 pb-2'>
                <p className='font-bold text-slate-700'>
                  Final OD Premium
                  {(ncb > 0 || (result.odDiscountVal || 0) > 0) && (
                    <span className='text-slate-400 font-normal'>
                      {ncb > 0 && (result.odDiscountVal || 0) > 0 ? ' (After NCB + Discount)' :
                       ncb > 0 ? ' (After NCB)' : ' (After Discount)'}
                    </span>
                  )}
                </p>
                <p className='font-black text-slate-900'>₹{fmtD(result.odPremium)}</p>
              </div>
            </>
          )}

          {showTP && (
            <div className='flex items-center justify-between text-xs border-b border-dashed border-slate-200 pb-2'>
              <p className='font-bold text-slate-700'>
                {isBundle
                  ? (vehicleType === 'two_wheeler' ? '5-Year TP Premium (Bundle)' : '3-Year TP Premium (Bundle)')
                  : '1-Year TP Premium'}
              </p>
              <p className='font-black text-slate-900'>₹{fmtD(result.tpPremium)}</p>
            </div>
          )}

          <div className='flex items-center justify-between text-xs pt-1'>
            <p className='font-bold text-slate-500'>Premium Before GST</p>
            <p className='font-black text-slate-800'>₹{fmtD(result.odPremium + result.tpPremium)}</p>
          </div>

          <div className='flex items-center justify-between text-xs'>
            <p className='font-bold text-slate-500'>GST Amount {gstEnabled ? '(18%)' : '(0% - Toggle Off)'}</p>
            <p className='font-black text-slate-800'>₹{fmtD(result.gst)}</p>
          </div>

          <div className='mt-2 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white shadow-xl shadow-indigo-200'>
            <div>
              <p className='text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80'>Final Payable Premium</p>
              <p className='text-2xl sm:text-3xl font-black tracking-tight'>₹{fmt(result.totalPremium)}</p>
              <p className='text-[8px] opacity-60 mt-0.5'>
                {gstEnabled ? 'incl. 18% GST' : 'excl. GST'} • {
                  policyType === 'od' ? 'Own Damage Only' :
                  policyType === 'tp' ? 'Third Party Only' :
                  policyType === 'comprehensive' ? 'Comprehensive' : 'Bundle Policy'
                }
              </p>
            </div>
            <div className='rounded-xl bg-white/20 p-2.5'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── FORM BY VEHICLE TYPE ──────────────────────────────────────────────────
  const renderForm = () => {
    switch (vehicleType) {

      // ── PRIVATE CAR ──────────────────────────────────────────────────────
      case 'private_car':
        const ccVal = parseFloat(cc) || 0
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Fuel Type</label>
              <div className='grid grid-cols-2 gap-2'>
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⛽ Petrol / Diesel / CNG</p>
                  <p className='text-[9px] text-slate-500'>ICE Vehicle</p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⚡ Electric</p>
                  <p className='text-[9px] text-slate-500'>EV Private Car</p>
                </button>
              </div>
            </div>
            <PolicyTypeSelector />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B']} />
              <AgeSelector />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {!isElectric ? (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine Capacity (CC)</label>
                  <div className='grid grid-cols-3 gap-1 rounded-2xl bg-slate-200 p-1 mb-2'>
                    {[
                      { label: '≤1000 CC', val: 999 },
                      { label: '1001–1500', val: 1200 },
                      { label: 'Above 1500', val: 1600 },
                    ].map(item => (
                      <button
                        key={item.label}
                        type='button'
                        onClick={() => setCc(item.val)}
                        className={`rounded-xl py-2 text-[9px] sm:text-[10px] font-bold transition-all ${
                          (item.val === 999 && ccVal <= 1000 && ccVal > 0) ||
                          (item.val === 1200 && ccVal > 1000 && ccVal <= 1500) ||
                          (item.val === 1600 && ccVal > 1500)
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
                  <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 45'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>Brackets: &lt;30 / 30–65 / {'>'}65 KW</p>
                </div>
              )}
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            {policyType !== 'tp' && <NCBSelector />}
            {policyType !== 'tp' && <ODDiscountInput />}
            <GSTToggle />
          </div>
        )

      // ── TWO WHEELER ─────────────────────────────────────────────────────
      case 'two_wheeler':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Type</label>
              <div className='grid grid-cols-2 gap-2'>
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⛽ Petrol / CNG</p>
                  <p className='text-[9px] text-slate-500'>ICE Vehicle</p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⚡ Electric</p>
                  <p className='text-[9px] text-slate-500'>EV / E-Scooter</p>
                </button>
              </div>
            </div>
            {!isElectric ? (
              <>
                <PolicyTypeSelector />
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <ZoneSelector zones={['A', 'B']} />
                  <AgeSelector />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine CC</label>
                    <input type='number' value={cc} onChange={e => setCc(e.target.value)} placeholder='e.g. 125'
                      className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                    <p className='mt-1 text-[8px] text-slate-400'>≤75 / 76–150 / 151–350 / {'>'}350 CC</p>
                  </div>
                  <IDVInput idv={idv} setIdv={setIdv} />
                </div>
                {policyType !== 'tp' && <NCBSelector />}
                {policyType !== 'tp' && <ODDiscountInput />}
                <GSTToggle />
              </>
            ) : (
              <>
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
                  <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 5'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>Brackets: &lt;3 / 3–7 / 7–16 / {'>'}16 KW</p>
                </div>
                <IDVInput idv={idv} setIdv={setIdv} />
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Policy Term</label>
                  <div className='flex gap-1.5 rounded-2xl bg-slate-200 p-1'>
                    {[['1yr', '1 Year'], ['5yr', '5 Years (Long Term)']].map(([val, label]) => (
                      <button key={val} onClick={() => setPolicyTerm(val)}
                        className={`flex-1 rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all ${policyTerm === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <CoverageSelector />
              </>
            )}
          </div>
        )

      // ── GCV ─────────────────────────────────────────────────────────────
      case 'gcv':
        return (
          <div className='space-y-4'>
            <div className='rounded-xl bg-amber-50 border border-amber-200 p-3'>
              <p className='text-[9px] font-bold text-amber-800'>GCV – Public Carriers Other Than 3W (A1)</p>
              <p className='text-[8px] text-amber-600 mt-0.5'>Zone A/B/C | GVW based TP | Extra ₹27/100 Kg above 12,000 Kg</p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>GVW (Gross Vehicle Weight in Kg)</label>
                <input type='number' value={gvw} onChange={e => setGvw(e.target.value)} placeholder='e.g. 8000'
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                <p className='mt-1 text-[8px] text-slate-400'>≤7500 / 7501–12000 / 12001–20000 / 20001–40000 / {'>'}40000</p>
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      // ── 3W GCV ──────────────────────────────────────────────────────────
      case 'gcv_3w':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Sub-Type</label>
              <div className='grid grid-cols-1 gap-2'>
                {TARIFF.gcv_3w.subtypes.map(st => (
                  <button key={st.id} onClick={() => setSubtype(st.id)}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                    <span className='text-[10px] font-bold text-indigo-600'>TP: ₹{fmt(st.tp)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <IDVInput idv={idv} setIdv={setIdv} />
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      // ── TAXI ────────────────────────────────────────────────────────────
      case 'taxi':
        return (
          <div className='space-y-4'>
            <div className='rounded-xl bg-red-50 border border-red-200 p-3'>
              <p className='text-[9px] font-bold text-red-800'>Taxi 4W ≤6 Psgr (C1 A) — TP = Base + (Psgr × Per-Seat Rate)</p>
            </div>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Fuel Type</label>
              <div className='grid grid-cols-2 gap-2'>
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⛽ Petrol / CNG / Diesel</p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>⚡ Electric Taxi</p>
                </button>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {!isElectric ? (
                <>
                  <ZoneSelector zones={['A', 'B']} />
                  <AgeSelector />
                </>
              ) : (
                <div className='col-span-2'>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
                  <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 40'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>&lt;30 / 30–65 / {'>'}65 KW</p>
                </div>
              )}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {!isElectric && (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine CC</label>
                  <input type='number' value={cc} onChange={e => setCc(e.target.value)} placeholder='e.g. 1200'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>≤1000 / 1001–1500 / {'>'}1500 CC</p>
                </div>
              )}
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No. of Passengers (excl. driver)</label>
                <input type='number' value={passengers} onChange={e => setPassengers(e.target.value)} placeholder='e.g. 4' min={1} max={6}
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      // ── BUS & MAXI PCV C2 ───────────────────────────────────────────────
      case 'pcv':
        return (
          <div className='space-y-4'>
            <div className='rounded-xl bg-green-50 border border-green-200 p-3'>
              <p className='text-[9px] font-bold text-green-800'>BUS & MAXI ≥4W & {'>'}6 Psgr (C2) — TP = Base + (Psgr × Seat Rate)</p>
            </div>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Bus Sub-Type</label>
              <div className='grid grid-cols-1 gap-2'>
                {TARIFF.pcv.subtypes.map(st => (
                  <button key={st.id} onClick={() => setSubtype(st.id)}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div>
                      <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                      <p className='text-[8px] text-slate-500'>Base ₹{fmt(st.tpBase)} + ₹{fmt(st.tpPerPsgr)}/psgr</p>
                    </div>
                    {st.isElectric && <span className='text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold'>EV</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No. of Passengers (Seating Capacity)</label>
                <input type='number' value={passengers} onChange={e => setPassengers(e.target.value)} placeholder='e.g. 36'
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
                <p className='mt-1 text-[8px] text-slate-400'>Add OD: ≤18 / 19–36 / 37–60 / {'>'}60 Psgr</p>
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      // ── 3W PCV ──────────────────────────────────────────────────────────
      case 'pcv_3w':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>3W PCV Sub-Type</label>
              <div className='grid grid-cols-1 gap-2'>
                {TARIFF.pcv_3w.subtypes.map(st => (
                  <button key={st.id} onClick={() => setSubtype(st.id)}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div>
                      <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                      <p className='text-[8px] text-slate-500'>Base ₹{fmt(st.tpBase)} + ₹{fmt(st.tpPerPsgr)}/psgr</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No. of Passengers</label>
                <input type='number' value={passengers} onChange={e => setPassengers(e.target.value)} placeholder='e.g. 3'
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300' />
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      // ── MISC-D ──────────────────────────────────────────────────────────
      case 'misc_d':
        return (
          <div className='space-y-4'>
            <div className='rounded-xl bg-slate-100 border border-slate-200 p-3'>
              <p className='text-[9px] font-bold text-slate-700'>Misc-D Class — OD Rate: 1.05% of IDV</p>
              <p className='text-[8px] text-slate-500 mt-0.5'>Includes: Agricultural tractors, cranes, road rollers, excavators & other special vehicles</p>
            </div>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Sub-Type</label>
              <div className='grid grid-cols-1 gap-2'>
                {TARIFF.misc_d.subtypes.map(st => (
                  <button key={st.id} onClick={() => setSubtype(st.id)}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                    <span className='text-[10px] font-bold text-indigo-600'>TP: ₹{fmt(st.tp)}</span>
                  </button>
                ))}
              </div>
            </div>
            <IDVInput idv={idv} setIdv={setIdv} />
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput />
          </div>
        )

      default:
        return null
    }
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100 px-3 pb-24 pt-4 sm:px-4 md:px-6'>
      <div className='mx-auto max-w-5xl'>

        {/* Header — only shown on vehicle selection screen */}
        {step === 1 && (
          <div className='mb-4'>
            <h1 className='text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight'>Premium Calculator</h1>
            <p className='mt-0.5 text-[7px] sm:text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400'>Indian Motor Tariff Rates • WEF 1st June 2022</p>
          </div>
        )}

        {/* Step 1 — Select Vehicle */}
        {step === 1 && (
          <div className='animate-in fade-in zoom-in-95 duration-300'>
            <div className='rounded-[28px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.12)]'>
              <h2 className='mb-4 text-center text-base sm:text-lg font-black text-slate-800'>Select Vehicle Category</h2>
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                {VEHICLE_CATEGORIES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleVehicleSelect(v.id)}
                    className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 text-left transition-all hover:shadow-lg active:scale-[0.98] ${v.light}`}
                  >
                    <div className={`absolute -right-3 -top-3 h-14 w-14 rounded-full bg-gradient-to-br ${v.gradient} opacity-10 transition-all group-hover:opacity-20 group-hover:scale-110`} />
                    <span className='text-2xl sm:text-3xl'>{v.icon}</span>
                    <h3 className='mt-2 text-[11px] sm:text-sm font-black text-slate-900 leading-tight'>{v.label}</h3>
                    <p className='mt-0.5 text-[9px] sm:text-[10px] font-bold text-slate-400'>{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Calculator Form */}
        {step === 2 && selectedCategory && (
          <div className='animate-in fade-in slide-in-from-right-6 duration-300'>
            <div className='rounded-[28px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.12)]'>

              {/* Back + Title */}
              <div className='mb-4 flex items-center gap-3'>
                <button
                  onClick={() => { setStep(1); setResult(null) }}
                  className='flex-shrink-0 rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-all active:scale-[0.95]'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{selectedCategory.icon}</span>
                  <div>
                    <h2 className='text-sm sm:text-base font-black text-slate-800 leading-tight'>{selectedCategory.label}</h2>
                    <p className='text-[9px] text-slate-400 font-medium'>{selectedCategory.desc}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Form */}
              <div className='space-y-4'>
                {renderForm()}

                {/* Calculate Button */}
                <button
                  onClick={calculatePremium}
                  className='mt-2 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-[11px] sm:text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:opacity-90 active:scale-[0.98]'
                >
                  Calculate Premium →
                </button>

                {/* Result */}
                {result && <ResultBox />}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className='mt-4 text-center text-[8px] text-slate-400 px-4'>
          ⚠️ For indicative purposes only. Premiums may vary based on insurer loading, add-ons & discounts. Ref: IRDAI website irdai.gov.in
        </p>
      </div>
    </div>
  )
}

export default PremiumCalculator
