import VEHICLE_CATEGORIES from './vehicleCategories'

const VehicleTypeGrid = ({ handleVehicleSelect }) => (
  <div className='animate-in fade-in zoom-in-95 duration-300'>
    <div className='rounded-[32px] border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)]'>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {VEHICLE_CATEGORIES.map(v => (
          <button
            key={v.id}
            onClick={() => handleVehicleSelect(v.id)}
            className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border-2 bg-white px-3 py-2 sm:py-4 md:py-2 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${v.light}`}
          >
            <div className={`absolute -right-4 -top-4 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br ${v.gradient} opacity-10 transition-all group-hover:opacity-20 group-hover:scale-110`} />
            <span className='flex-1 flex items-center justify-center mb-2'>{v.image ? <img src={v.image} alt={v.label} className='h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 object-contain' /> : <span className='text-5xl sm:text-6xl'>{v.icon}</span>}</span>
            <h3 className='text-[11px] sm:text-sm font-black text-slate-900 leading-tight'>{v.label}</h3>
            <p className='mt-0.5 text-[9px] sm:text-[10px] font-bold text-slate-400'>{v.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
)

export default VehicleTypeGrid
