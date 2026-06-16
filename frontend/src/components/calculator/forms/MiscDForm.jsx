import TARIFF from '../tariffData'
import { fmt } from '../helpers'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput, LoadingDiscountInput, DepreciationInput } from '../SharedFields'

const MiscDForm = ({
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
  imt23, setImt23,
  currentYear,
}) => (
  <div className='space-y-4'>
    <div className='rounded-xl bg-slate-100 border border-slate-200 p-3'>
      <p className='text-[9px] font-bold text-slate-700'>Misc-D Class — OD Rate: 1.05% of IDV</p>
    </div>
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Vehicle Category</label>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        {TARIFF.misc_d.subtypes.map(st => (
          <button key={st.id} onClick={() => setSubtype(st.id)}
            className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all flex justify-between items-center ${subtype === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <span className='text-[11px] sm:text-xs font-black text-slate-800'>{st.label}</span>
            <span className='text-[10px] font-bold text-blue-600'>TP: ₹{fmt(st.tp)}</span>
          </button>
        ))}
      </div>
    </div>
    <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <ZoneSelector zone={zone} setZone={setZone} zones={['C', 'B', 'A']} />
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
      <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-5 gap-3'>
      <IDVInput idv={idv} setIdv={setIdv} />
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>IMT 23</label>
        <select
          value={imt23}
          onChange={e => setImt23(e.target.value)}
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
        >
          <option value="no">No</option>
          <option value="yes">Yes (15% of OD)</option>
        </select>
      </div>
      <NCBSelector ncb={ncb} setNcb={setNcb} />
      <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />
      <LoadingDiscountInput loadingDiscount={loadingDiscount} setLoadingDiscount={setLoadingDiscount} />
      <DepreciationInput depreciation={depreciation} setDepreciation={setDepreciation} />
    </div>
  </div>
)

export default MiscDForm
