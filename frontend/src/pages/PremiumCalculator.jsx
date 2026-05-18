import { useState } from 'react'

const PremiumCalculator = () => {
  const [step, setStep] = useState(1) // 1: Select Vehicle, 2: Calculator Form
  const [vehicleType, setVehicleType] = useState('private_car')
  const [zone, setZone] = useState('A')
  const [vehicleAge, setVehicleAge] = useState('upto_5')
  const [idv, setIdv] = useState('')
  const [capacity, setCapacity] = useState('') // CC for bikes/cars/taxis, GVW for GCV
  const [ncb, setNcb] = useState(0)
  const [coverageType, setCoverageType] = useState('comprehensive')
  const [result, setResult] = useState(null)

  const calculatePremium = () => {
    let odRate = 0
    let tpPremium = 0
    const idvVal = parseFloat(idv) || 0
    const capacityVal = parseFloat(capacity) || 0

    if (vehicleType === 'private_car') {
      if (capacityVal <= 1000) {
        tpPremium = 2094
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 3.127 : 3.039
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 3.283 : 3.191
        else odRate = zone === 'A' ? 3.362 : 3.267
      } else if (capacityVal <= 1500) {
        tpPremium = 3416
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 3.283 : 3.191
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 3.447 : 3.351
        else odRate = zone === 'A' ? 3.529 : 3.430
      } else {
        tpPremium = 7897
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 3.440 : 3.343
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 3.612 : 3.510
        else odRate = zone === 'A' ? 3.698 : 3.596
      }
    } else if (vehicleType === 'two_wheeler') {
      if (capacityVal <= 75) tpPremium = 538
      else if (capacityVal <= 150) tpPremium = 714
      else if (capacityVal <= 350) tpPremium = 1366
      else tpPremium = 2804

      if (capacityVal <= 150) {
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 1.708 : 1.676
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 1.793 : 1.760
        else odRate = zone === 'A' ? 1.836 : 1.802
      } else if (capacityVal <= 350) {
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 1.793 : 1.760
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 1.883 : 1.848
        else odRate = zone === 'A' ? 1.928 : 1.892
      } else {
        if (vehicleAge === 'upto_5') odRate = zone === 'A' ? 1.879 : 1.844
        else if (vehicleAge === '5_to_7') odRate = zone === 'A' ? 1.973 : 1.936
        else odRate = zone === 'A' ? 2.020 : 1.982
      }
    } else if (vehicleType === 'gcv') {
      odRate = 1.5 // Flat assumption for GCV
      if (capacityVal <= 7500) tpPremium = 16049
      else if (capacityVal <= 12000) tpPremium = 27186
      else if (capacityVal <= 20000) tpPremium = 35313
      else if (capacityVal <= 40000) tpPremium = 43950
      else tpPremium = 44242
    } else if (vehicleType === 'taxi') {
      odRate = 1.5 // Flat assumption for Taxi
      if (capacityVal <= 1000) tpPremium = 6040
      else if (capacityVal <= 1500) tpPremium = 7940
      else tpPremium = 10523
    }

    let odPremium = 0
    if (coverageType === 'comprehensive') {
      odPremium = idvVal * (odRate / 100)
      // Apply NCB to OD only
      odPremium = odPremium * (1 - ncb / 100)
    }

    const netPremium = odPremium + tpPremium
    const gst = netPremium * 0.18
    const totalPremium = netPremium + gst

    setResult({
      odPremium: Math.round(odPremium),
      tpPremium: Math.round(tpPremium),
      gst: Math.round(gst),
      totalPremium: Math.round(totalPremium)
    })
  }

  const handleVehicleSelect = (type) => {
    setVehicleType(type)
    setResult(null)
    setStep(2)
  }

  const vehicleOptions = [
    { id: 'private_car', label: 'Private Car', icon: '🚗', desc: 'Personal use 4-wheelers' },
    { id: 'two_wheeler', label: 'Two Wheeler', icon: '🏍️', desc: 'Scooters & Motorcycles' },
    { id: 'gcv', label: 'GCV / Truck', icon: '🚚', desc: 'Goods Carrying Vehicles' },
    { id: 'taxi', label: 'Taxi / Cab', icon: '🚕', desc: 'Passenger Carrying Vehicles' }
  ]

  const selectedVehicleLabel = vehicleOptions.find(v => v.id === vehicleType)?.label

  return (
    <div className='min-h-screen bg-slate-100 px-3 pb-24 pt-4 sm:px-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-2xl'>
        {step === 1 && (
          <div className='mb-5 text-center md:text-left'>
            <h1 className='text-xl md:text-2xl font-black text-slate-900 tracking-tight'>Premium Calculator</h1>
            <p className='mt-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500'>Estimate Insurance Cost (IMT Rates)</p>
          </div>
        )}

        <div className='rounded-[24px] sm:rounded-[32px] border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.15)] md:p-8'>
          
          {step === 1 ? (
            <div className='animate-in fade-in zoom-in-95 duration-300'>
              <h2 className='mb-4 sm:mb-6 text-center text-base sm:text-lg font-black text-slate-800'>Select Vehicle Category</h2>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                {vehicleOptions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleVehicleSelect(v.id)}
                    className='group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-6 text-left transition-all hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98]'
                  >
                    <div className='absolute -right-4 -top-4 rounded-full bg-slate-50 p-6 sm:p-8 transition-colors group-hover:bg-indigo-50'>
                      <span className='text-3xl sm:text-4xl'>{v.icon}</span>
                    </div>
                    <div className='relative z-10'>
                      <h3 className='text-base sm:text-xl font-black text-slate-900 transition-colors group-hover:text-indigo-600'>{v.label}</h3>
                      <p className='mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold text-slate-500 pr-8'>{v.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='animate-in fade-in slide-in-from-right-8 duration-300 space-y-5 sm:space-y-6'>
              
              <div className='flex items-center gap-3 mb-2 sm:mb-4'>
                <button 
                  onClick={() => setStep(1)} 
                  className='flex-shrink-0 rounded-xl bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-all active:scale-[0.95]'
                >
                  <svg className='h-4 w-4 sm:h-5 sm:w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <h2 className='text-base sm:text-lg font-black text-slate-800 line-clamp-1'>Calculating for: <span className='text-indigo-600'>{selectedVehicleLabel}</span></h2>
              </div>

              {/* Zone & Age */}
              <div className='grid gap-3 sm:gap-4 grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Zone</label>
                  <div className='flex gap-1.5 sm:gap-2 rounded-[14px] sm:rounded-2xl bg-slate-200 p-1'>
                    <button
                      onClick={() => setZone('A')}
                      className={`flex-1 rounded-[10px] sm:rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all ${zone === 'A' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Zone A
                    </button>
                    <button
                      onClick={() => setZone('B')}
                      className={`flex-1 rounded-[10px] sm:rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all ${zone === 'B' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Zone B
                    </button>
                  </div>
                </div>

                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Age of Vehicle</label>
                  <div className='flex gap-1 rounded-[14px] sm:rounded-2xl bg-slate-200 p-1'>
                    <button onClick={() => setVehicleAge('upto_5')} className={`flex-1 rounded-[10px] sm:rounded-xl py-2 text-[9px] sm:text-[10px] font-bold transition-all ${vehicleAge === 'upto_5' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>0-5 Yrs</button>
                    <button onClick={() => setVehicleAge('5_to_7')} className={`flex-1 rounded-[10px] sm:rounded-xl py-2 text-[9px] sm:text-[10px] font-bold transition-all ${vehicleAge === '5_to_7' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>5-7 Yrs</button>
                    <button onClick={() => setVehicleAge('above_7')} className={`flex-1 rounded-[10px] sm:rounded-xl py-2 text-[9px] sm:text-[10px] font-bold transition-all ${vehicleAge === 'above_7' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>&gt;7 Yrs</button>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>IDV (Vehicle Value in ₹)</label>
                  <input
                    type='number'
                    value={idv}
                    onChange={(e) => setIdv(e.target.value)}
                    placeholder='e.g. 500000'
                    className='w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300'
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>
                    {vehicleType === 'gcv' ? 'Weight (GVW in Kg)' : 'Engine Capacity (CC)'}
                  </label>
                  <input
                    type='number'
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder={vehicleType === 'gcv' ? 'e.g. 12000' : 'e.g. 1200'}
                    className='w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No Claim Bonus (NCB %)</label>
                <div className='grid grid-cols-5 gap-1.5 sm:gap-2'>
                  {[0, 20, 25, 35, 50].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNcb(val)}
                      className={`rounded-xl border py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold transition-all ${ncb === val ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Coverage Type</label>
                <div className='grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2'>
                  <button
                    onClick={() => setCoverageType('comprehensive')}
                    className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 text-left transition-all ${coverageType === 'comprehensive' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <p className='text-[11px] sm:text-xs font-black text-slate-900'>Comprehensive</p>
                    <p className='mt-0.5 text-[9px] sm:text-[10px] text-slate-500 font-medium'>OD + Third Party</p>
                  </button>
                  <button
                    onClick={() => setCoverageType('tp')}
                    className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 text-left transition-all ${coverageType === 'tp' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <p className='text-[11px] sm:text-xs font-black text-slate-900'>Third Party</p>
                    <p className='mt-0.5 text-[9px] sm:text-[10px] text-slate-500 font-medium'>Mandatory Only</p>
                  </button>
                </div>
              </div>

              <button
                onClick={calculatePremium}
                className='mt-2 w-full rounded-xl sm:rounded-2xl bg-indigo-600 py-3.5 sm:py-4 text-[11px] sm:text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98]'
              >
                Calculate Premium
              </button>

              {result && (
                <div className='mt-6 space-y-3 sm:space-y-4 border-t border-slate-200 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                  <div className='flex items-center justify-between'>
                    <p className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>OD Premium ({ncb}% NCB)</p>
                    <p className='text-xs sm:text-sm font-black text-slate-900'>₹{result.odPremium}</p>
                  </div>
                  <div className='flex items-center justify-between'>
                    <p className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>TP Premium</p>
                    <p className='text-xs sm:text-sm font-black text-slate-900'>₹{result.tpPremium}</p>
                  </div>
                  <div className='flex items-center justify-between'>
                    <p className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>GST (18%)</p>
                    <p className='text-xs sm:text-sm font-black text-slate-900'>₹{result.gst}</p>
                  </div>
                  <div className='mt-3 flex items-center justify-between rounded-xl sm:rounded-2xl bg-indigo-600 p-3 sm:p-4 text-white shadow-xl shadow-indigo-100'>
                    <div>
                      <p className='text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80'>Total Premium</p>
                      <p className='text-xl sm:text-2xl font-black tracking-tight'>₹{result.totalPremium}</p>
                    </div>
                    <div className='rounded-lg sm:rounded-xl bg-white/20 p-2'>
                      <svg className='h-5 w-5 sm:h-6 sm:w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M9 5l7 7-7 7' />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PremiumCalculator

