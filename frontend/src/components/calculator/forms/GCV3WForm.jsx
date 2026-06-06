import { FaGasPump, FaBolt } from 'react-icons/fa6'
import TARIFF from '../tariffData'
import { fmt } from '../helpers'
import { CoverageSelector, ZoneSelector, ManufacturingYearInput, AgeSelector, IDVInput, NCBSelector, ODDiscountInput } from '../SharedFields'

const GCV3WForm = ({
  subtype, setSubtype,
  isElectric, setIsElectric,
  cc, setCc,
  kwPower, setKwPower,
  zone, setZone,
  manufacturingYear, setManufacturingYear,
  vehicleAge, setVehicleAge,
  idv, setIdv,
  ncb, setNcb,
  odDiscount, setOdDiscount,
  coverageType, setCoverageType,
  geoExtent, setGeoExtent,
  imt23, setImt23,
  currentYear,
}) => {
  const handleFuelToggle = (electric) => {
    setIsElectric(electric)
    setSubtype(electric ? 'erickshaw_gcv' : 'public')
  }

  const petrolTP = TARIFF.gcv_3w.subtypes.find(st => st.id === 'public').tp
  const electricTP = TARIFF.gcv_3w.subtypes.find(st => st.id === 'erickshaw_gcv').tp

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500'>Fuel Type</label>
        <div className='grid grid-cols-2 gap-2'>
          <button onClick={() => handleFuelToggle(false)} className={`rounded-2xl border-2 p-3 text-left transition-all ${!isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className='text-[11px] font-black text-slate-900'>
              <FaGasPump className='inline-block h-4 w-4 mr-1 -mt-0.5 text-amber-500' />
              Petrol / Diesel / CNG
            </p>
            <p className='text-[9px] text-blue-600 font-bold'>TP: ₹{fmt(petrolTP)}</p>
          </button>
          <button onClick={() => handleFuelToggle(true)} className={`rounded-2xl border-2 p-3 text-left transition-all ${isElectric ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className='text-[11px] font-black text-slate-900'>
              <FaBolt className='inline-block h-4 w-4 mr-1 -mt-0.5 text-yellow-500' />
              Electric
            </p>
            <p className='text-[9px] text-blue-600 font-bold'>TP: ₹{fmt(electricTP)}</p>
          </button>
        </div>
      </div>
      <CoverageSelector coverageType={coverageType} setCoverageType={setCoverageType} />
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
        <IDVInput idv={idv} setIdv={setIdv} />
        <ZoneSelector zone={zone} setZone={setZone} zones={['A', 'B', 'C']} />
        <ManufacturingYearInput manufacturingYear={manufacturingYear} setManufacturingYear={setManufacturingYear} currentYear={currentYear} />
        <AgeSelector vehicleAge={vehicleAge} setVehicleAge={setVehicleAge} />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
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
      </div>
    </div>
  )
}

export default GCV3WForm
