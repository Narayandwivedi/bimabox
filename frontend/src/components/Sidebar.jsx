import { useLocation } from 'react-router-dom'

const sidebarItems = [
  { id: 'vehicle', title: 'Add Vehicle', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
    </svg>
  ), color: 'blue' },
  { id: 'fitness', title: 'Add Fitness', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
    </svg>
  ), color: 'rose' },
  { id: 'tax', title: 'Add Tax', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ), color: 'emerald' },
  { id: 'puc', title: 'Add PUC', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
    </svg>
  ), color: 'amber' },
  { id: 'gps', title: 'Add GPS', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
    </svg>
  ), color: 'indigo' },
  { id: 'insurance', title: 'Add Insurance', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
    </svg>
  ), color: 'blue' },
  { id: 'permit', title: 'Add Permit', icon: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
    </svg>
  ), color: 'teal' },
]

const Sidebar = ({ show, onHide, onAddVehicle, onAddFitness, onAddTax, onAddPuc, onAddGps, onAddInsurance, onAddPermit }) => {
  const handlers = {
    vehicle: onAddVehicle,
    fitness: onAddFitness,
    tax: onAddTax,
    puc: onAddPuc,
    gps: onAddGps,
    insurance: onAddInsurance,
    permit: onAddPermit
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${show ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onHide}
      />

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${show ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='flex h-full flex-col'>
          <div className='mb-8 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 overflow-hidden rounded-2xl bg-blue-600 p-1 shadow-lg shadow-blue-200'>
                <img src='/logo.png' alt='BimaBox' className='h-full w-full object-contain brightness-0 invert' />
              </div>
              <div>
                <h1 className='text-lg font-black text-slate-900'>BimaBox</h1>
                <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Menu</p>
              </div>
            </div>
            <button onClick={onHide} className='rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 lg:hidden'>
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          <nav className='flex-1 space-y-2'>
            <p className='mb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>Management</p>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (handlers[item.id]) handlers[item.id]()
                  if (onHide) onHide()
                }}
                className='group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white px-4 py-3.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-100'
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600 shadow-sm group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <span className='text-sm font-bold text-slate-700 group-hover:text-slate-900'>{item.title}</span>
              </button>
            ))}
          </nav>

          <div className='mt-auto pt-6 border-t border-slate-100'>
            <div className='rounded-3xl bg-slate-900 p-6 shadow-2xl'>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>Support</p>
              <p className='text-sm font-black text-white mb-4'>Need assistance?</p>
              <button className='w-full rounded-xl bg-white py-2.5 text-xs font-bold text-slate-900 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]'>
                Contact Helpdesk
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
