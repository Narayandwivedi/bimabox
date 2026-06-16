import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput, LoadingDiscountInput, DepreciationInput } from '../SharedFields'

const GCVForm = ({
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
    <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B', 'C']} />
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
      <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>GVW (Gross Vehicle Weight in Kg)</label>
        <input type='number' value={gvw} onChange={e => setGvw(e.target.value)} placeholder='e.g. 8000'
          className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
        <p className='mt-1 text-[8px] text-slate-400'>≤7500 / 7501–12000 / 12001–20000 / 20001–40000 / {'>'}40000</p>
      </div>
      <IDVInput idv={idv} setIdv={setIdv} />
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
    <div className='grid grid-cols-1 sm:grid-cols-5 gap-3'>
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

export default GCVForm
