import TARIFF from '../tariffData'
import { fmt } from '../helpers'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVSection } from '../SharedFields'

const PCV3WForm = ({
  subtype, setSubtype,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  loadingDiscount, setLoadingDiscount,
  depreciation, setDepreciation,
  coverageType, setCoverageType,
  passengers, setPassengers,
  currentYear,
}) => (
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
    <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B', 'C']} />
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
      <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>No. of Passengers</label>
        <input type='number' value={passengers} onChange={e => setPassengers(e.target.value)} placeholder='e.g. 3' min={0}
          className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
      </div>
    </div>
    <IDVSection
      idv={idv} setIdv={setIdv}
      depreciation={depreciation} setDepreciation={setDepreciation}
      ncb={ncb} setNcb={setNcb}
      odDiscount={odDiscount} setOdDiscount={setOdDiscount}
      loadingDiscount={loadingDiscount} setLoadingDiscount={setLoadingDiscount}
    />
  </div>
)

export default PCV3WForm
