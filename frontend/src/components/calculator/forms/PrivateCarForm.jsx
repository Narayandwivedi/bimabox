import { FaGasPump, FaBolt } from 'react-icons/fa6'
import { PolicyTypeSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput } from '../SharedFields'

const PrivateCarForm = ({
  isElectric, setIsElectric,
  cc, setCc,
  kwPower, setKwPower,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  policyType, setPolicyType,
  bundleOdTerm, setBundleOdTerm, bundleTpTerm, setBundleTpTerm,
  vehicleType,
  currentYear,
}) => (
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
    <PolicyTypeSelector policyType={policyType} setPolicyType={setPolicyType} vehicleType={vehicleType} bundleOdTerm={bundleOdTerm} setBundleOdTerm={setBundleOdTerm} bundleTpTerm={bundleTpTerm} setBundleTpTerm={setBundleTpTerm} />
    <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
      <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B']} />
      <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
      <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
      {!isElectric ? (
        <div>
          <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Engine Capacity (CC)</label>
          <input
            type='number'
            value={cc}
            onChange={e => setCc(e.target.value)}
            placeholder='e.g. 1500'
            min={0}
            className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300 transition-all'
          />
          {cc && !isNaN(parseFloat(cc)) && (
            <p className='mt-1 text-[8px] text-slate-400'>
              {parseFloat(cc) <= 1000 ? '≤1000 CC' : parseFloat(cc) <= 1500 ? '1001–1500 CC' : '>1500 CC'} bracket
            </p>
          )}
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
      {policyType !== 'tp' && <NCBSelector ncb={ncb} setNcb={setNcb} />}
      {policyType !== 'tp' && <ODDiscountInput odDiscount={odDiscount} setOdDiscount={setOdDiscount} />}
    </div>
  </div>
)

export default PrivateCarForm
