import { FaGasPump, FaBolt } from 'react-icons/fa6'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput, LoadingDiscountInput } from '../SharedFields'

const TaxiForm = ({
  isElectric, setIsElectric,
  cc, setCc,
  kwPower, setKwPower,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  loadingDiscount, setLoadingDiscount,
  coverageType, setCoverageType,
  passengers, setPassengers,
  currentYear,
}) => (
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
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      {!isElectric ? (
        <>
          <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B']} />
          <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
          <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
        </>
      ) : (
        <div className='col-span-3'>
          <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
          <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 40'
            className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
          <p className='mt-1 text-[8px] text-slate-400'>&lt;30 / 30–65 / {'>'}65 KW</p>
        </div>
      )}
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
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
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
    </div>
    <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
    <NCBSelector ncb={ncb} setNcb={setNcb} />
    <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
    <LoadingDiscountInput loadingDiscount={loadingDiscount} setLoadingDiscount={setLoadingDiscount} />
  </div>
)

export default TaxiForm
