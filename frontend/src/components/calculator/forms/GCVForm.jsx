import { FaGasPump, FaBolt } from 'react-icons/fa6'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVSection } from '../SharedFields'

const GCVForm = ({
  isElectric, setIsElectric,
  gvw, setGvw,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  loadingDiscount, setLoadingDiscount,
  depreciation, setDepreciation,
  coverageType, setCoverageType,
  geoExtent, setGeoExtent,
  imt23, setImt23,
  currentYear,
}) => (
  <div className='space-y-4'>
    <div className='rounded-xl bg-amber-50 border border-amber-200 p-3'>
      <p className='text-[9px] font-bold text-amber-800'>GCV – Public Carriers Other Than 3W (A1)</p>
      <p className='text-[8px] text-amber-600 mt-0.5'>Zone A/B/C | GVW based TP | Extra ₹27/100 Kg above 12,000 Kg</p>
    </div>
    <div>
      <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Fuel Type</label>
      <div className='grid grid-cols-2 gap-2'>
        <button onClick={() => setIsElectric(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <p className='text-[11px] font-black text-slate-900'>
            <FaGasPump className='inline-block h-4 w-4 mr-1 -mt-0.5 text-amber-500' />
            Diesel GCV
          </p>
        </button>
        <button onClick={() => setIsElectric(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <p className='text-[11px] font-black text-slate-900'>
            <FaBolt className='inline-block h-4 w-4 mr-1 -mt-0.5 text-yellow-500' />
            Electric GCV
          </p>
        </button>
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
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>GVW (Gross Vehicle Weight in Kg)</label>
        <input type='number' value={gvw} onChange={e => setGvw(e.target.value)} placeholder='e.g. 8000'
          className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
        <p className='mt-1 text-[8px] text-slate-400'>≤7500 / 7501–12000 / 12001–20000 / 20001–40000 / {'>'}40000</p>
      </div>
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Geographical Ext (₹)</label>
        <select
          value={geoExtent}
          onChange={e => setGeoExtent(e.target.value)}
          className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all'
        >
          <option value="0">₹0 – Not Applicable</option>
          <option value="400">₹400 – Extend Coverage</option>
        </select>
      </div>
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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

export default GCVForm
