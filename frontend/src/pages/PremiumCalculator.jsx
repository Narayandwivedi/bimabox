import { useState, useEffect } from 'react'
import { FaCar, FaMotorcycle, FaTruck, FaTruckPickup, FaBus, FaVanShuttle, FaTaxi, FaTractor, FaGasPump, FaBolt } from 'react-icons/fa6'

const IDVInput = ({ idv, setIdv }) => (
  <div>
    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>IDV – Insured Declared Value (₹)</label>
    <input
      type='number'
      value={idv}
      onChange={e => setIdv(e.target.value)}
      placeholder='e.g. 500000'
      className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300'
    />
  </div>
)

const ODDiscountInput = ({ odDiscount, setOdDiscount }) => (
  <div>
    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>OD Discount (%)</label>
    <input
      type='text'
      inputMode='numeric'
      value={odDiscount}
      onChange={e => {
        const val = e.target.value
        if (val === '' || /^\d+$/.test(val)) {
          setOdDiscount(val)
        }
      }}
      placeholder='e.g. 25'
      className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-300 transition-all'
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
    subtypes: [
      { id: 'public', label: '3W GCV (A2)', tp: 4492 },
      { id: 'erickshaw_gcv', label: '3W e-Rickshaw GCV', tp: 3139 },
    ],
    odRates: {
      upto_5: { A: 1.664, B: 1.656, C: 1.640 },
      '5_to_7': { A: 1.706, B: 1.697, C: 1.681 },
      above_7: { A: 1.747, B: 1.739, C: 1.722 },
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
  { id: 'private_car', label: 'Private Car', icon: <FaCar className='h-7 w-7 sm:h-8 sm:w-8 text-blue-600' />, image: '/calculator/private%20car_converted.avif', desc: 'Personal 4-Wheeler', gradient: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { id: 'two_wheeler', label: '2W / Motorcycle', icon: <FaMotorcycle className='h-7 w-7 sm:h-8 sm:w-8 text-purple-600' />, image: '/calculator/2%20wheeler_converted.avif', desc: 'Scooter & Motorcycle', gradient: 'from-purple-500 to-violet-600', light: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { id: 'gcv', label: 'GCV', icon: <FaTruck className='h-7 w-7 sm:h-8 sm:w-8 text-orange-600' />, image: '/calculator/gcv_converted.avif', desc: 'Goods Carrying Vehicle', gradient: 'from-orange-500 to-amber-600', light: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { id: 'gcv_3w', label: '3W GCV', icon: <FaTruckPickup className='h-7 w-7 sm:h-8 sm:w-8 text-amber-600' />, image: '/calculator/gcv%203%20wheel_converted.avif', desc: '3-Wheeler Goods Vehicle', gradient: 'from-blue-400 to-amber-400', light: 'bg-blue-50 border-amber-200 hover:border-blue-400' },
  { id: 'pcv', label: 'BUS & MAXI', icon: <FaBus className='h-7 w-7 sm:h-8 sm:w-8 text-green-600' />, image: '/calculator/pcv_converted.avif', desc: '≥4W & >6 Passengers', gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 border-green-200 hover:border-green-400' },
  { id: 'pcv_3w', label: '3W PCV', icon: <FaVanShuttle className='h-7 w-7 sm:h-8 sm:w-8 text-teal-600' />, image: '/calculator/3w%20pcv_converted.avif', desc: '3-Wheeler Passenger Vehicle', gradient: 'from-teal-500 to-cyan-600', light: 'bg-teal-50 border-teal-200 hover:border-teal-400' },
  { id: 'taxi', label: 'Taxi', icon: <FaTaxi className='h-7 w-7 sm:h-8 sm:w-8 text-rose-600' />, image: '/calculator/taxi_converted.avif', desc: '4W ≤6 Passengers', gradient: 'from-red-500 to-rose-600', light: 'bg-red-50 border-red-200 hover:border-red-400' },
  { id: 'misc_d', label: 'Misc-D Special', icon: <FaTractor className='h-7 w-7 sm:h-8 sm:w-8 text-slate-600' />, image: '/calculator/miscl%20d_converted.avif', desc: 'Special Vehicles & Tractors', gradient: 'from-slate-500 to-gray-600', light: 'bg-slate-50 border-slate-200 hover:border-slate-400' },
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
  const [odDiscount, setOdDiscount] = useState('')

  // Vehicle-specific
  const [cc, setCc] = useState('')             // Private Car / Taxi / 2W
  const [kwPower, setKwPower] = useState('')   // Electric vehicles KW
  const [isElectric, setIsElectric] = useState(false)
  const [gvw, setGvw] = useState('')           // GCV
  const [passengers, setPassengers] = useState('') // PCV/Taxi passengers
  const [subtype, setSubtype] = useState('')   // For 3W, PCV, Misc-D sub-types
  const [policyTerm, setPolicyTerm] = useState('1yr') // 1yr / 5yr for 2W
  const [manufacturingYear, setManufacturingYear] = useState('')
  const [llPaidDriver, setLlPaidDriver] = useState('')
  const [paOwnerDriver, setPaOwnerDriver] = useState('')
  const [llToEmployee, setLlToEmployee] = useState('')
  const [rsa, setRsa] = useState('')
  const [geoExtent, setGeoExtent] = useState('0')
  const [otherAddon, setOtherAddon] = useState('')
  const [paUnnamedPassenger, setPaUnnamedPassenger] = useState('')

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
    setOdDiscount('')
    setPolicyTerm('1yr')
    setManufacturingYear('')
    setLlPaidDriver('')
    setPaOwnerDriver('')
    setLlToEmployee('')
    setRsa('')
    setGeoExtent('0')
    setOtherAddon('')
    setPaUnnamedPassenger('')
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

    const llPdAmount = parseFloat(llPaidDriver) || 0
    const paOdAmount = parseFloat(paOwnerDriver) || 0
    const llEmployeeAmount = parseFloat(llToEmployee) || 0
    const rsaAmount = parseFloat(rsa) || 0
    const otherAddonAmount = parseFloat(otherAddon) || 0
    const paUnnamedAmount = parseFloat(paUnnamedPassenger) || 0
    const geoExtentAmount = parseFloat(geoExtent) || 0

    const netPremium = odPremium + tpPremium + llPdAmount + paOdAmount + llEmployeeAmount + rsaAmount + otherAddonAmount + paUnnamedAmount + geoExtentAmount
    const gst = gstEnabled ? netPremium * 0.18 : 0
    const totalPremium = netPremium + gst

    setResult({
      odPremium,                          // raw – shown exact in breakup
      tpPremium,                          // raw
      llPdAmount,
      paOdAmount,
      llEmployeeAmount,
      rsaAmount,
      otherAddonAmount,
      paUnnamedAmount,
      geoExtentAmount,
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
  }, [vehicleType, zone, vehicleAge, idv, ncb, odDiscount, coverageType, policyType, gstEnabled, cc, kwPower, isElectric, gvw, passengers, subtype, policyTerm, llPaidDriver, paOwnerDriver, llToEmployee, geoExtent, rsa, otherAddon, paUnnamedPassenger])

  const ChevronDown = () => (
    <svg className='pointer-events-none h-4 w-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
    </svg>
  )

  // ─── ZONE SELECTOR ─────────────────────────────────────────────────────────
  const ZoneSelector = ({ zones = ['A', 'B'] }) => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>RTO Zone</label>
      <div className='relative'>
        <select
          value={zone}
          onChange={e => setZone(e.target.value)}
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
        >
          {zones.map(z => (
            <option key={z} value={z}>Zone {z}</option>
          ))}
        </select>
        <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
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
      <div className='relative'>
        <select
          value={vehicleAge}
          onChange={e => setVehicleAge(e.target.value)}
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
        >
          <option value='upto_5'>0–5 Yrs</option>
          <option value='5_to_7'>5–7 Yrs</option>
          <option value='above_7'>&gt;7 Yrs</option>
        </select>
        <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
      </div>
    </div>
  )

  // ─── NCB ───────────────────────────────────────────────────────────────────
  const NCBSelector = () => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No Claim Bonus (NCB)</label>
      <div className='relative'>
        <select
          value={ncb}
          onChange={e => setNcb(Number(e.target.value))}
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
        >
          <option value={0}>0 Yr (0%)</option>
          <option value={20}>1 Yr (20%)</option>
          <option value={25}>2 Yr (25%)</option>
          <option value={35}>3 Yr (35%)</option>
          <option value={45}>4 Yr (45%)</option>
          <option value={50}>5 Yr (50%)</option>
        </select>
        <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
      </div>
    </div>
  )

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
              className={`rounded-2xl border-2 p-3 text-left transition-all ${policyType === p.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <p className='text-[11px] sm:text-xs font-black text-slate-900'>{p.label}</p>
              <p className='mt-0.5 text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight'>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const CoverageSelector = () => (
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Class of Insurance</label>
      <div className='grid gap-2 grid-cols-2'>
        {[['comprehensive', 'Comprehensive', 'OD + Third Party'], ['tp', 'Third Party Only', 'Mandatory Only']].map(([val, title, sub]) => (
          <button
            key={val}
            onClick={() => setCoverageType(val)}
            className={`rounded-2xl border-2 p-3 text-left transition-all ${coverageType === val ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
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

    const shareQuotation = () => {
      const quoteId = `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to share/print the quotation.')
        return
      }

      const vehicleSpec = isElectric
        ? `${kwPower || 0} KW (Electric)`
        : `${cc || 0} CC (Petrol/Diesel/CNG)`

      const policyLabel = policyType === 'od' ? 'Own Damage Only' :
                          policyType === 'tp' ? 'Third Party Only' :
                          policyType === 'comprehensive' ? 'Comprehensive Cover' :
                          (vehicleType === 'two_wheeler' ? '1-Year OD + 5-Year TP Bundle' : '1-Year OD + 3-Year TP Bundle')

      const tpLabel = isBundle
        ? (vehicleType === 'two_wheeler' ? '5-Year TP Premium' : '3-Year TP Premium')
        : '1-Year TP Premium'

      let tableRows = ''
      if (showOD) {
        tableRows += `
          <tr>
            <td>Basic Own Damage (OD) Premium</td>
            <td class="text-right">${result.odRate}%</td>
            <td class="text-right">₹${fmtD(odBase)}</td>
          </tr>
        `
        if (ncb > 0) {
          tableRows += `
            <tr class="discount-text">
              <td>No Claim Bonus (NCB) Discount</td>
              <td class="text-right">-${ncb}%</td>
              <td class="text-right">- ₹${fmtD(ncbDiscount)}</td>
            </tr>
          `
        }
        if (result.odDiscountVal > 0) {
          tableRows += `
            <tr class="discount-text">
              <td>Insurer OD Discount</td>
              <td class="text-right">-${result.odDiscountVal}%</td>
              <td class="text-right">- ₹${fmtD(odDiscountAmt)}</td>
            </tr>
          `
        }
        tableRows += `
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td>Final Own Damage (OD) Premium</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.odPremium)}</td>
          </tr>
        `
      }

      if (showTP) {
        tableRows += `
          <tr>
            <td>Third Party Liability (TP) Premium (${tpLabel})</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.tpPremium)}</td>
          </tr>
        `
      }

      if (result.llPdAmount > 0) {
        tableRows += `
          <tr>
            <td>Legal Liability to Paid Driver</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.llPdAmount)}</td>
          </tr>
        `
      }
      if (result.paOdAmount > 0) {
        tableRows += `
          <tr>
            <td>Personal Accident to Owner Driver</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.paOdAmount)}</td>
          </tr>
        `
      }
      if (result.llEmployeeAmount > 0) {
        tableRows += `
          <tr>
            <td>Legal Liability to Employee (other than Paid Driver)</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.llEmployeeAmount)}</td>
          </tr>
        `
      }
      if (result.rsaAmount > 0) {
        tableRows += `
          <tr>
            <td>Roadside Assistance (RSA)</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.rsaAmount)}</td>
          </tr>
        `
      }
      if (result.paUnnamedAmount > 0) {
        tableRows += `
          <tr>
            <td>PA to Unnamed Passenger</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.paUnnamedAmount)}</td>
          </tr>
        `
      }
      if (result.otherAddonAmount > 0) {
        tableRows += `
          <tr>
            <td>Other Addon Coverage</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.otherAddonAmount)}</td>
          </tr>
        `
      }
      if (result.geoExtentAmount > 0) {
        tableRows += `
          <tr>
            <td>Geographical Extent</td>
            <td class="text-right">-</td>
            <td class="text-right">₹${fmtD(result.geoExtentAmount)}</td>
          </tr>
        `
      }

      const netPremium = result.odPremium + result.tpPremium + result.llPdAmount + result.paOdAmount + result.llEmployeeAmount + result.rsaAmount + result.otherAddonAmount + result.paUnnamedAmount + result.geoExtentAmount
      const exactTotal = netPremium + result.gst

      tableRows += `
        <tr style="border-top: 2px solid #e2e8f0;">
          <td>Premium Before Taxes</td>
          <td class="text-right">-</td>
          <td class="text-right">₹${fmtD(netPremium)}</td>
        </tr>
        <tr>
          <td>Goods and Services Tax (GST ${gstEnabled ? '18%' : '0%'})</td>
          <td class="text-right">${gstEnabled ? '18%' : '0%'}</td>
          <td class="text-right">₹${fmtD(result.gst)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Payable Premium (Exact)</td>
          <td class="text-right">-</td>
          <td class="text-right">₹${fmtD(exactTotal)}</td>
        </tr>
      `

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Insurance Quotation ${quoteId}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              font-size: 14px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.5px;
            }
            .quote-title {
              text-align: right;
            }
            .quote-title h1 {
              margin: 0;
              font-size: 20px;
              color: #1e1b4b;
              font-weight: 900;
            }
            .quote-title p {
              margin: 5px 0 0;
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 30px;
            }
            .details-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
            }
            .details-box h3 {
              margin: 0 0 12px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #4f46e5;
              border-bottom: 1px dashed #cbd5e1;
              padding-bottom: 8px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-label {
              color: #64748b;
              font-weight: 500;
            }
            .detail-value {
              font-weight: 700;
              color: #0f172a;
            }
            .table-title {
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
              color: #1e293b;
              margin-bottom: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f1f5f9;
              color: #475569;
              font-weight: 700;
              text-align: left;
              padding: 12px;
              font-size: 12px;
              text-transform: uppercase;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            .text-right {
              text-align: right;
            }
            .discount-text {
              color: #16a34a;
              font-weight: 600;
            }
            .total-row {
              background-color: #e0e7ff;
              font-weight: 900;
              font-size: 16px;
              color: #312e81;
            }
            .total-row td {
              border-top: 2px solid #4f46e5;
              border-bottom: 2px solid #4f46e5;
              padding: 16px 12px;
            }
            .disclaimer {
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .actions {
              margin-top: 20px;
              text-align: center;
            }
            @media print {
              .no-print {
                display: none;
              }
              body {
                padding: 0;
              }
            }
            .btn {
              background-color: #4f46e5;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 700;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              transition: all 0.2s;
            }
            .btn:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="no-print actions" style="margin-bottom: 20px;">
            <button class="btn" onclick="window.print()">Print or Save as PDF</button>
          </div>
          
          <div class="header">
            <div class="logo">BIMABOX</div>
            <div class="quote-title">
              <h1>INSURANCE QUOTATION</h1>
              <p>ID: ${quoteId} • Date: ${dateStr}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-box">
              <h3>Vehicle Details</h3>
              <div class="detail-row">
                <span class="detail-label">Vehicle Category</span>
                <span class="detail-value">${selectedCategory ? selectedCategory.label : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Specification</span>
                <span class="detail-value">${vehicleSpec}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">RTO Zone</span>
                <span class="detail-value">Zone ${zone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Age</span>
                <span class="detail-value">${vehicleAge === 'upto_5' ? 'Upto 5 Yrs' : vehicleAge === '5_to_7' ? '5–7 Yrs' : '>7 Yrs'}</span>
              </div>
              ${manufacturingYear ? `<div class="detail-row"><span class="detail-label">Mfg Year</span><span class="detail-value">${manufacturingYear}</span></div>` : ''}
            </div>

            <div class="details-box">
              <h3>Quotation Details</h3>
              <div class="detail-row">
                <span class="detail-label">Policy Type</span>
                <span class="detail-value">${policyLabel}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insured Declared Value (IDV)</span>
                <span class="detail-value">₹${fmtD(parseFloat(idv) || 0)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">No Claim Bonus (NCB)</span>
                <span class="detail-value">${ncb}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurer OD Discount</span>
                <span class="detail-value">${result.odDiscountVal}%</span>
              </div>
            </div>
          </div>

          <div class="table-title">Premium Calculation Breakup</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Rate / Percentage</th>
                <th class="text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>


          <div class="disclaimer">
            This is an indicative system-generated insurance quotation prepared under the Indian Motor Tariff guidelines. The final premium is subject to actual verification of vehicle registration details, previous policy claim history, and underwriting guidelines of the respective insurance company.
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
    }

    return (
      <div className='border-t border-slate-200 pt-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <div className='space-y-3'>
          <h3 className='text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2'>Premium Breakup</h3>

          {/* ─── Own Damage ─── */}
          {showOD && (
            <div className='rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 p-3 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-blue-500' />
                  <h4 className='text-[10px] font-black uppercase tracking-widest text-blue-700'>Own Damage</h4>
                </div>
                <span className='text-[9px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full'>Subtotal</span>
              </div>
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
                    <p className='font-bold'>NCB Discount ({ncb}%)</p>
                    <p className='font-black'>- ₹{fmtD(ncbDiscount)}</p>
                  </div>
                </>
              )}
              {(result.odDiscountVal || 0) > 0 && (
                <div className='flex items-center justify-between text-xs text-orange-600'>
                  <p className='font-bold'>OD Discount ({result.odDiscountVal}%)</p>
                  <p className='font-black'>- ₹{fmtD(odDiscountAmt)}</p>
                </div>
              )}
              <div className='flex items-center justify-between text-xs border-t border-blue-200 pt-2 mt-1'>
                <p className='font-black text-blue-800'>Total OD Premium</p>
                <p className='font-black text-blue-800'>₹{fmtD(result.odPremium)}</p>
              </div>
            </div>
          )}

          {/* ─── Liability / Third Party ─── */}
          {showTP && (
            <div className='rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100 p-3 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-amber-500' />
                  <h4 className='text-[10px] font-black uppercase tracking-widest text-amber-700'>Liability / Third Party</h4>
                </div>
                <span className='text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full'>Subtotal</span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-700'>
                  {isBundle
                    ? (vehicleType === 'two_wheeler' ? '5-Year TP Premium (Bundle)' : '3-Year TP Premium (Bundle)')
                    : '1-Year TP Premium'}
                </p>
                <p className='font-black text-amber-800'>₹{fmtD(result.tpPremium)}</p>
              </div>
            </div>
          )}

          {/* ─── Add-on Coverages ─── */}
          {(result.llPdAmount > 0 || result.paOdAmount > 0 || result.llEmployeeAmount > 0 || result.rsaAmount > 0 || result.otherAddonAmount > 0 || result.paUnnamedAmount > 0 || result.geoExtentAmount > 0) && (
            <div className='rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 p-3 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-emerald-500' />
                  <h4 className='text-[10px] font-black uppercase tracking-widest text-emerald-700'>Add-on Coverages</h4>
                </div>
                <span className='text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full'>Subtotal</span>
              </div>
              <div className='space-y-1.5'>
                {result.llPdAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>LL to Paid Driver</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.llPdAmount)}</p>
                  </div>
                )}
                {result.paOdAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>PA to Owner Driver</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.paOdAmount)}</p>
                  </div>
                )}
                {result.llEmployeeAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>LL to Employee (other than Paid Driver)</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.llEmployeeAmount)}</p>
                  </div>
                )}
                {result.rsaAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>RSA – Roadside Assistance</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.rsaAmount)}</p>
                  </div>
                )}
                {result.paUnnamedAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>PA to Unnamed Passenger</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.paUnnamedAmount)}</p>
                  </div>
                )}
                {result.otherAddonAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>Other Addon Coverage</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.otherAddonAmount)}</p>
                  </div>
                )}
                {result.geoExtentAmount > 0 && (
                  <div className='flex items-center justify-between text-xs'>
                    <p className='font-bold text-slate-500'>Geographical Extent</p>
                    <p className='font-black text-slate-800'>₹{fmtD(result.geoExtentAmount)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Totals ─── */}
          <div className='rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <p className='font-bold text-slate-500'>Total before GST</p>
              <p className='font-black text-slate-800'>₹{fmtD(result.odPremium + result.tpPremium + result.llPdAmount + result.paOdAmount + result.llEmployeeAmount + result.rsaAmount + result.otherAddonAmount + result.paUnnamedAmount + result.geoExtentAmount)}</p>
            </div>
            <div className='flex items-center justify-between text-xs'>
              <p className='font-bold text-slate-500'>GST {gstEnabled ? '(18%)' : '(0%)'}</p>
              <p className='font-black text-slate-800'>₹{fmtD(result.gst)}</p>
            </div>
          </div>

          <div className='flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-5 text-white shadow-xl shadow-indigo-200'>
            <div className='space-y-1'>
              <p className='text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80'>Final Payable Premium</p>
              <p className='text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm'>₹{fmt(result.totalPremium)}</p>
              <p className='text-[8px] opacity-60'>
                {gstEnabled ? 'incl. 18% GST' : 'excl. GST'} • {
                  policyType === 'od' ? 'Own Damage' :
                  policyType === 'tp' ? 'Third Party' :
                  policyType === 'comprehensive' ? 'Comprehensive' : 'Bundle'
                }
              </p>
            </div>
            <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>

          <div className='rounded-xl bg-slate-50/80 border border-slate-200 p-3 sm:p-4'>
            <p className='text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3'>Share Quotation</p>
            <div className='grid grid-cols-3 gap-2 sm:gap-3'>
              {/* WhatsApp */}
              <button
                onClick={() => {
                  const quoteId = `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
                  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  const policyLabel = policyType === 'od' ? 'Own Damage Only' : policyType === 'tp' ? 'Third Party Only' : policyType === 'comprehensive' ? 'Comprehensive' : (vehicleType === 'two_wheeler' ? '1Yr OD + 5Yr TP Bundle' : '1Yr OD + 3Yr TP Bundle')
                  const vehicleSpec = isElectric ? `${kwPower || 0} KW (Electric)` : `${cc || 0} CC`
                  const netPremium = result.odPremium + result.tpPremium
                  const exactTotal = netPremium + result.gst

                  let msg = `🏷️ *INSURANCE QUOTATION – BIMABOX*\n`
                  msg += `📋 ID: ${quoteId}  |  Date: ${dateStr}\n`
                  msg += `─────────────────────\n`
                  msg += `🚗 *Vehicle Details*\n`
                  msg += `Category: ${selectedCategory ? selectedCategory.label : 'N/A'}\n`
                  msg += `Spec: ${vehicleSpec}${isElectric ? '' : ' (Petrol/CNG)'}\n`
                  msg += `Zone: ${zone}  |  Age: ${vehicleAge === 'upto_5' ? 'Upto 5 Yrs' : vehicleAge === '5_to_7' ? '5–7 Yrs' : '>7 Yrs'}\n`
                  msg += `─────────────────────\n`
                  msg += `📄 *Policy: ${policyLabel}*\n`
                  msg += `IDV: ₹${fmtD(parseFloat(idv) || 0)}\n`
                  msg += `NCB: ${ncb}%  |  OD Discount: ${result.odDiscountVal}%\n`
                  msg += `─────────────────────\n`
                  msg += `💰 *Premium Breakup*\n`
                  if (showOD) {
                    msg += `OD (Base): ₹${fmtD(odBase)}\n`
                    if (ncb > 0) msg += `NCB (${ncb}%): - ₹${fmtD(ncbDiscount)}\n`
                    if ((result.odDiscountVal || 0) > 0) msg += `OD Discount (${result.odDiscountVal}%): - ₹${fmtD(odDiscountAmt)}\n`
                    msg += `Final OD: ₹${fmtD(result.odPremium)}\n`
                  }
                  if (showTP) {
                    const tpL = isBundle ? (vehicleType === 'two_wheeler' ? '5Yr TP' : '3Yr TP') : '1Yr TP'
                    msg += `${tpL}: ₹${fmtD(result.tpPremium)}\n`
                  }
                  if (result.llPdAmount > 0) msg += `LL to Paid Driver: ₹${fmtD(result.llPdAmount)}\n`
                  if (result.llEmployeeAmount > 0) msg += `LL to Employee (other than Paid Driver): ₹${fmtD(result.llEmployeeAmount)}\n`
                  if (result.paOdAmount > 0) msg += `PA to Owner Driver: ₹${fmtD(result.paOdAmount)}\n`
                  if (result.rsaAmount > 0) msg += `RSA: ₹${fmtD(result.rsaAmount)}\n`
                  if (result.otherAddonAmount > 0) msg += `Other Addon: ₹${fmtD(result.otherAddonAmount)}\n`
                  if (result.paUnnamedAmount > 0) msg += `PA Unnamed Passenger: ₹${fmtD(result.paUnnamedAmount)}\n`
                  if (result.geoExtentAmount > 0) msg += `Geographical Extent: ₹${fmtD(result.geoExtentAmount)}\n`
                  msg += `GST (${gstEnabled ? '18%' : '0%'}): ₹${fmtD(result.gst)}\n`
                  msg += `─────────────────────\n`
                  msg += `💳 *Total Payable: ₹${fmtD(exactTotal)}*\n`
                  msg += `─────────────────────\n`
                  msg += `_Indicative as per IMT. Ref: irdai.gov.in_`

                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                }}
                className='flex flex-col items-center gap-1.5 rounded-xl border-2 border-green-200 bg-green-50 py-3 text-green-700 hover:bg-green-100 hover:shadow-md hover:shadow-green-200 active:scale-[0.97] transition-all'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                </svg>
                <span className='text-[9px] font-black uppercase tracking-wide'>WhatsApp</span>
              </button>

              {/* Native Share / Other Apps */}
              <button
                onClick={() => {
                  const quoteId = `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
                  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  const policyLabel = policyType === 'od' ? 'Own Damage Only' : policyType === 'tp' ? 'Third Party Only' : policyType === 'comprehensive' ? 'Comprehensive' : (vehicleType === 'two_wheeler' ? '1Yr OD + 5Yr TP Bundle' : '1Yr OD + 3Yr TP Bundle')
                  const vehicleSpec = isElectric ? `${kwPower || 0} KW (Electric)` : `${cc || 0} CC`
                  const netPremium = result.odPremium + result.tpPremium
                  const exactTotal = netPremium + result.gst

                  let shareText = `INSURANCE QUOTATION – BIMABOX\nID: ${quoteId} | Date: ${dateStr}\n\nVehicle: ${selectedCategory ? selectedCategory.label : ''} | ${vehicleSpec} | Zone ${zone}\nPolicy: ${policyLabel} | IDV: ₹${fmtD(parseFloat(idv) || 0)} | NCB: ${ncb}%`
                  if (showOD) shareText += `\nOD Premium: ₹${fmtD(result.odPremium)}`
                  if (showTP) shareText += `\nTP Premium: ₹${fmtD(result.tpPremium)}`
                  if (result.llPdAmount > 0) shareText += `\nLL to Paid Driver: ₹${fmtD(result.llPdAmount)}`
                  if (result.llEmployeeAmount > 0) shareText += `\nLL to Employee (other than Paid Driver): ₹${fmtD(result.llEmployeeAmount)}`
                  if (result.paOdAmount > 0) shareText += `\nPA to Owner Driver: ₹${fmtD(result.paOdAmount)}`
                  if (result.rsaAmount > 0) shareText += `\nRSA: ₹${fmtD(result.rsaAmount)}`
                  if (result.otherAddonAmount > 0) shareText += `\nOther Addon: ₹${fmtD(result.otherAddonAmount)}`
                  if (result.paUnnamedAmount > 0) shareText += `\nPA Unnamed Passenger: ₹${fmtD(result.paUnnamedAmount)}`
                  if (result.geoExtentAmount > 0) shareText += `\nGeographical Extent: ₹${fmtD(result.geoExtentAmount)}`
                  shareText += `\nGST: ₹${fmtD(result.gst)}\nTotal Payable: ₹${fmtD(exactTotal)}\n\nIndicative as per IMT. Ref: irdai.gov.in`

                  if (navigator.share) {
                    navigator.share({ title: `Quotation ${quoteId} – BIMABOX`, text: shareText })
                      .catch(() => {})
                  } else {
                    navigator.clipboard.writeText(shareText).then(() => alert('Quotation text copied! Paste it to share.'))
                  }
                }}
                className='flex flex-col items-center gap-1.5 rounded-xl border-2 border-blue-200 bg-blue-50 py-3 text-blue-700 hover:bg-blue-100 hover:shadow-md hover:shadow-blue-200 active:scale-[0.97] transition-all'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                </svg>
                <span className='text-[9px] font-black uppercase tracking-wide'>Share</span>
              </button>

              {/* Print / PDF */}
              <button
                onClick={shareQuotation}
                className='flex flex-col items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 py-3 text-slate-700 hover:bg-slate-100 hover:shadow-md hover:shadow-slate-200 active:scale-[0.97] transition-all'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
                </svg>
                <span className='text-[9px] font-black uppercase tracking-wide'>Print</span>
              </button>
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
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaGasPump className='inline-block h-4 w-4 mr-1 -mt-0.5 text-amber-500' />
                    Petrol / Diesel / CNG
                  </p>
                  <p className='text-[9px] text-slate-500'>ICE Vehicle</p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaBolt className='inline-block h-4 w-4 mr-1 -mt-0.5 text-yellow-500' />
                    Electric
                  </p>
                  <p className='text-[9px] text-slate-500'>EV Private Car</p>
                </button>
              </div>
            </div>
            <PolicyTypeSelector />
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <ZoneSelector zones={['A', 'B']} />
              <AgeSelector />
              {!isElectric ? (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine Capacity (CC)</label>
                  <div className='relative'>
                    <select
                      value={ccVal > 1500 ? 1600 : ccVal > 1000 ? 1200 : ccVal > 0 ? 999 : ''}
                      onChange={e => setCc(e.target.value)}
                      className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
                    >
                      <option value='' disabled>Select CC</option>
                      <option value={999}>≤1000 CC</option>
                      <option value={1200}>1001–1500 CC</option>
                      <option value={1600}>&gt;1500 CC</option>
                    </select>
                    <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
                  <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 45'
                    className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300 transition-all' />
                  <p className='mt-1 text-[8px] text-slate-400'>Brackets: &lt;30 / 30–65 / {'>'}65 KW</p>
                </div>
              )}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <IDVInput idv={idv} setIdv={setIdv} />
              {policyType !== 'tp' && <NCBSelector />}
              {policyType !== 'tp' && <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />}
            </div>
          </div>
        )

      // ── TWO WHEELER ─────────────────────────────────────────────────────
      case 'two_wheeler':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Type</label>
              <div className='grid grid-cols-2 gap-2'>
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaGasPump className='inline-block h-4 w-4 mr-1 -mt-0.5 text-amber-500' />
                    Petrol / CNG
                  </p>
                  <p className='text-[9px] text-slate-500'>ICE Vehicle</p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaBolt className='inline-block h-4 w-4 mr-1 -mt-0.5 text-yellow-500' />
                    Electric
                  </p>
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
                      className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                    <p className='mt-1 text-[8px] text-slate-400'>≤75 / 76–150 / 151–350 / {'>'}350 CC</p>
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <IDVInput idv={idv} setIdv={setIdv} />
                  {policyType !== 'tp' && <NCBSelector />}
                  {policyType !== 'tp' && <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
                  <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 5'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>Brackets: &lt;3 / 3–7 / 7–16 / {'>'}16 KW</p>
                </div>
                <IDVInput idv={idv} setIdv={setIdv} />
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Policy Term</label>
                  <div className='flex gap-1.5 rounded-2xl bg-slate-200 p-1'>
                    {[['1yr', '1 Year'], ['5yr', '5 Years (Long Term)']].map(([val, label]) => (
                      <button key={val} onClick={() => setPolicyTerm(val)}
                        className={`flex-1 rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all ${policyTerm === val ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
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
            <CoverageSelector />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>GVW (Gross Vehicle Weight in Kg)</label>
                <input type='number' value={gvw} onChange={e => setGvw(e.target.value)} placeholder='e.g. 8000'
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                <p className='mt-1 text-[8px] text-slate-400'>≤7500 / 7501–12000 / 12001–20000 / 20001–40000 / {'>'}40000</p>
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Geographical Extent</label>
              <div className='relative'>
                <select value={geoExtent} onChange={e => setGeoExtent(e.target.value)}
                  className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'>
                  <option value='0'>Not Opted</option>
                  <option value='400'>Rs 400</option>
                </select>
                <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
              </div>
            </div>
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
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
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                    <span className='text-[10px] font-bold text-blue-600'>TP: ₹{fmt(st.tp)}</span>
                  </button>
                ))}
              </div>
            </div>
            <CoverageSelector />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <ZoneSelector zones={['A', 'B', 'C']} />
              <AgeSelector />
            </div>
            <IDVInput idv={idv} setIdv={setIdv} />
            <div>
              <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Geographical Extent</label>
              <div className='relative'>
                <select value={geoExtent} onChange={e => setGeoExtent(e.target.value)}
                  className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'>
                  <option value='0'>Not Opted</option>
                  <option value='400'>Rs 400</option>
                </select>
                <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
              </div>
            </div>
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
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
                <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaGasPump className='inline-block h-4 w-4 mr-1 -mt-0.5 text-amber-500' />
                    Petrol / CNG / Diesel
                  </p>
                </button>
                <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className='text-[11px] font-black text-slate-900'>
                    <FaBolt className='inline-block h-4 w-4 mr-1 -mt-0.5 text-yellow-500' />
                    Electric Taxi
                  </p>
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
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>&lt;30 / 30–65 / {'>'}65 KW</p>
                </div>
              )}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {!isElectric && (
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine CC</label>
                  <input type='number' value={cc} onChange={e => setCc(e.target.value)} placeholder='e.g. 1200'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                  <p className='mt-1 text-[8px] text-slate-400'>≤1000 / 1001–1500 / {'>'}1500 CC</p>
                </div>
              )}
              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No. of Passengers (excl. driver)</label>
                <input type='number' value={passengers} onChange={e => setPassengers(e.target.value)} placeholder='e.g. 4' min={1} max={6}
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
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
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
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
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
                <p className='mt-1 text-[8px] text-slate-400'>Add OD: ≤18 / 19–36 / 37–60 / {'>'}60 Psgr</p>
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
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
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
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
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
              </div>
              <IDVInput idv={idv} setIdv={setIdv} />
            </div>
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
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
                    className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
                    <span className='text-[10px] font-bold text-blue-600'>TP: ₹{fmt(st.tp)}</span>
                  </button>
                ))}
              </div>
            </div>
            <IDVInput idv={idv} setIdv={setIdv} />
            <CoverageSelector />
            <NCBSelector />
            <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
          </div>
        )

      default:
        return null
    }
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)] px-3 pb-24 pt-4 sm:px-4 md:px-6'>
      <div className='mx-auto max-w-6xl'>

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
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)]'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-blue-200'>C</div>
                <div>
                  <h2 className='text-sm sm:text-base font-black text-slate-800'>Select Vehicle Category</h2>
                  <p className='text-[9px] text-slate-400 font-medium'>Choose your vehicle type to calculate premium</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                {VEHICLE_CATEGORIES.map(v => (
                    <button
                    key={v.id}
                    onClick={() => handleVehicleSelect(v.id)}
                    className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border-2 bg-white px-3 py-2 sm:py-4 md:py-2 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${v.light}`}
                  >
                    <div className={`absolute -right-4 -top-4 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br ${v.gradient} opacity-10 transition-all group-hover:opacity-20 group-hover:scale-110`} />
                    <span className='flex-1 flex items-center justify-center mb-2'>{v.image ? <img src={v.image} alt={v.label} className='h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 object-contain' /> : <span className='text-5xl sm:text-6xl'>{v.icon}</span>}</span>
                    <h3 className='text-[11px] sm:text-sm font-black text-slate-900 leading-tight'>{v.label}</h3>
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
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)]'>

              {/* Back + Title */}
              <div className='mb-5 flex items-center gap-3'>
                <button
                  onClick={() => { setStep(1); setResult(null) }}
                  className='flex-shrink-0 rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-[0.95]'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'>
                    {selectedCategory.image ? <img src={selectedCategory.image} alt={selectedCategory.label} className='h-5 w-5 object-contain brightness-0 invert' /> : <span className='text-sm'>{selectedCategory.icon}</span>}
                  </div>
                  <div>
                    <h2 className='text-sm sm:text-base font-black text-slate-800 leading-tight'>{selectedCategory.label}</h2>
                    <p className='text-[9px] text-slate-400 font-medium'>{selectedCategory.desc}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-5'>
                {/* ─── Section: Own Damage ─── */}
                <div className='rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 p-3 sm:p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-[10px] font-black'>1</div>
                    <h3 className='text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-800'>Own Damage</h3>
                  </div>
                  {renderForm()}
                </div>

                {/* ─── Section: Add-on Coverages ─── */}
                <div className='rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 p-3 sm:p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-[10px] font-black'>2</div>
                    <h3 className='text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-800'>Add-on Coverages</h3>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div>
                      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>RSA – Roadside Assistance (₹)</label>
                      <input
                        type='number'
                        value={rsa}
                        onChange={e => setRsa(e.target.value)}
                        placeholder='e.g. 300'
                        min={0}
                        className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300 transition-all'
                      />
                    </div>
                    <div>
                      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Other Addon Coverage (₹)</label>
                      <input
                        type='number'
                        value={otherAddon}
                        onChange={e => setOtherAddon(e.target.value)}
                        placeholder='e.g. 500'
                        min={0}
                        className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300 transition-all'
                      />
                    </div>
                  </div>
                </div>

                {/* ─── Section: Liability / Third Party ─── */}
                <div className='rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100 p-3 sm:p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-white text-[10px] font-black'>3</div>
                    <h3 className='text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-800'>Liability / Third Party</h3>
                  </div>
                  <div className='space-y-3'>
                    <p className='text-[9px] sm:text-[10px] text-amber-700 font-medium bg-amber-100/50 rounded-xl px-3 py-2'>
                      Third Party premium is calculated automatically based on your vehicle specifications above.
                    </p>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                      <div>
                        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>LL to Paid Driver (₹)</label>
                        <input
                          type='number'
                          value={llPaidDriver}
                          onChange={e => setLlPaidDriver(e.target.value)}
                          placeholder={vehicleType === 'two_wheeler' ? 'e.g. 10' : 'e.g. 50'}
                          min={0}
                          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-300 transition-all'
                        />
                      </div>
                      <div>
                        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>PA to Owner Driver (₹)</label>
                        <input
                          type='number'
                          value={paOwnerDriver}
                          onChange={e => setPaOwnerDriver(e.target.value)}
                          placeholder={vehicleType === 'two_wheeler' ? 'e.g. 50' : 'e.g. 100'}
                          min={0}
                          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-300 transition-all'
                        />
                      </div>
                      {(vehicleType === 'private_car' || vehicleType === 'two_wheeler') ? (
                        <div>
                          <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>PA to Unnamed Passenger (₹)</label>
                          <input
                            type='number'
                            value={paUnnamedPassenger}
                            onChange={e => setPaUnnamedPassenger(e.target.value)}
                            placeholder={vehicleType === 'two_wheeler' ? 'e.g. 50' : 'e.g. 200'}
                            min={0}
                            className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-300 transition-all'
                          />
                        </div>
                      ) : (vehicleType === 'gcv' || vehicleType === 'gcv_3w') ? (
                        <div>
                          <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>LL to Employee (other than Paid Driver) (₹)</label>
                          <input
                            type='number'
                            value={llToEmployee}
                            onChange={e => setLlToEmployee(e.target.value)}
                            placeholder='e.g. 50'
                            min={0}
                            className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-300 transition-all'
                          />
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculatePremium}
                  className='mt-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-[11px] sm:text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-[0.98]'
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
          <svg className='inline-block h-3 w-3 mr-1 -mt-0.5 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}><path d='M12 9v2m0 4h.01M10.29 3.86l-8.1 14c-.6 1.04.15 2.14 1.21 2.14h16.2c1.06 0 1.81-1.1 1.21-2.14l-8.1-14c-.6-1.04-1.82-1.04-2.42 0z' /></svg>For indicative purposes only. Premiums may vary based on insurer loading, add-ons & discounts. Ref: IRDAI website irdai.gov.in
        </p>
      </div>
    </div>
  )
}

export default PremiumCalculator
