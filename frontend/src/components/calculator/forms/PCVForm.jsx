import TARIFF from '../tariffData'
import { fmt } from '../helpers'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput } from '../SharedFields'

const PCVForm = ({
  subtype, setSubtype,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  coverageType, setCoverageType,
  passengers, setPassengers,
  currentYear,
}) => (
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
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B', 'C']} />
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
      <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
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
    <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
    <NCBSelector ncb={ncb} setNcb={setNcb} />
    <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
  </div>
)

export default PCVForm
