export const ChevronDown = () => (
  <svg className='pointer-events-none h-4 w-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
  </svg>
)

export const IDVInput = ({ idv, setIdv }) => (
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

export const ODDiscountInput = ({ odDiscount, setOdDiscount }) => (
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

export const ZoneSelector = ({ zone, setZone, zones = ['A', 'B'] }) => (
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

export const AgeSelector = ({ vehicleAge, setVehicleAge }) => (
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

export const ManufacturingYearInput = ({ manufacturingYear, setManufacturingYear, currentYear }) => (
  <div>
    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Year of Manufacture</label>
    <input
      type='number'
      value={manufacturingYear}
      onChange={e => setManufacturingYear(e.target.value)}
      placeholder='e.g. 2020'
      min={1990}
      max={currentYear}
      className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300 transition-all'
    />
  </div>
)

export const NCBSelector = ({ ncb, setNcb }) => (
  <div>
    <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No Claim Bonus (NCB)</label>
    <div className='relative'>
      <select
        value={ncb}
        onChange={e => setNcb(Number(e.target.value))}
        className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
      >
        <option value={0}>0%</option>
        <option value={20}>20%</option>
        <option value={25}>25%</option>
        <option value={35}>35%</option>
        <option value={45}>45%</option>
        <option value={50}>50%</option>
      </select>
      <span className='absolute right-3 top-1/2 -translate-y-1/2'><ChevronDown /></span>
    </div>
  </div>
)

export const PolicyTypeSelector = ({ policyType, setPolicyType, vehicleType }) => {
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

export const CoverageSelector = ({ coverageType, setCoverageType }) => (
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
