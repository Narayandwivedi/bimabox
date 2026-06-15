import { FaGasPump, FaBolt } from 'react-icons/fa6'
import { PolicyTypeSelector, CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput, LoadingDiscountInput } from '../SharedFields'

const TwoWheelerForm = ({
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
  policyType, setPolicyType,
  bundleOdTerm, setBundleOdTerm, bundleTpTerm, setBundleTpTerm,
  coverageType, setCoverageType,
  vehicleType,
  currentYear,
}) => (
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
        <PolicyTypeSelector policyType={policyType} setPolicyType={setPolicyType} vehicleType={vehicleType} bundleOdTerm={bundleOdTerm} setBundleOdTerm={setBundleOdTerm} bundleTpTerm={bundleTpTerm} setBundleTpTerm={setBundleTpTerm} />
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
          <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B']} />
          <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
          <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
          <div>
            <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine CC</label>
            <input type='number' value={cc} onChange={e => setCc(e.target.value)} placeholder='e.g. 125'
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
            <p className='mt-1 text-[8px] text-slate-400'>≤75 / 76–150 / 151–350 / {'>'}350 CC</p>
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
          <IDVInput idv={idv} setIdv={setIdv} />
          {policyType !== 'tp' && <NCBSelector ncb={ncb} setNcb={setNcb} />}
          {policyType !== 'tp' && <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />}
          <LoadingDiscountInput loadingDiscount={loadingDiscount} setLoadingDiscount={setLoadingDiscount} />
        </div>
      </>
    ) : (
      <>
        <PolicyTypeSelector policyType={policyType} setPolicyType={setPolicyType} vehicleType={vehicleType} bundleOdTerm={bundleOdTerm} setBundleOdTerm={setBundleOdTerm} bundleTpTerm={bundleTpTerm} setBundleTpTerm={setBundleTpTerm} />
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div>
            <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Motor Power (KW)</label>
            <input type='number' value={kwPower} onChange={e => setKwPower(e.target.value)} placeholder='e.g. 5'
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300' />
            <p className='mt-1 text-[8px] text-slate-400'>Brackets: &lt;3 / 3–7 / 7–16 / {'>'}16 KW</p>
          </div>
          <IDVInput idv={idv} setIdv={setIdv} />
        </div>
        <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
      </>
    )}
  </div>
)

export default TwoWheelerForm
