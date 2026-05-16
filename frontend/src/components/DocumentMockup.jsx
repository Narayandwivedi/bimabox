const DocumentMockup = ({ 
  type = 'N/A', 
  vehicleNumber = 'N/A', 
  chassisNumber,
  policyNumber,
  ownerName,
  validFrom = 'N/A',
  validTo = 'N/A',
  color = 'indigo' 
}) => {
  return (
    <div className='relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl shadow-slate-200'>
      {/* Header */}
      <div className='bg-slate-900 p-5 text-white'>
        <div className='flex items-center justify-between'>
          <div className='h-10 w-10 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs italic'>IA</div>
          <div className='text-right'>
            <h2 className='text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400'>Official Document</h2>
            <p className='text-sm font-black uppercase tracking-tight'>{type} Certificate</p>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className='p-6'>
        <div className='mb-8 space-y-5'>
          {/* Main ID Section */}
          <div className='rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4'>
            <p className='mb-1 text-[8px] font-bold uppercase tracking-widest text-slate-400'>Vehicle Registration Number</p>
            <p className='text-xl font-black tracking-[0.1em] text-slate-900'>{vehicleNumber}</p>
          </div>

          {/* Secondary Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            {chassisNumber && chassisNumber !== 'N/A' && (
              <div className='space-y-1'>
                <p className='text-[8px] font-bold uppercase tracking-widest text-slate-400'>Chassis Number</p>
                <p className='text-[11px] font-black text-slate-800'>{chassisNumber}</p>
              </div>
            )}
            {policyNumber && policyNumber !== 'N/A' && (
              <div className='space-y-1'>
                <p className='text-[8px] font-bold uppercase tracking-widest text-slate-400'>Document Number</p>
                <p className='text-[11px] font-black text-slate-800'>{policyNumber}</p>
              </div>
            )}
            {ownerName && ownerName !== 'N/A' && (
              <div className='space-y-1 col-span-2'>
                <p className='text-[8px] font-bold uppercase tracking-widest text-slate-400'>Owner Name</p>
                <p className='text-[11px] font-black text-slate-800'>{ownerName}</p>
              </div>
            )}
          </div>

          <hr className='border-slate-100' />

          {/* Validity Section */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-xl border border-emerald-100 bg-emerald-50/30 p-3'>
              <p className='text-[8px] font-bold uppercase tracking-widest text-emerald-600 mb-1'>Valid From</p>
              <p className='text-xs font-black text-emerald-900'>{validFrom}</p>
            </div>
            <div className='rounded-xl border border-rose-100 bg-rose-50/30 p-3'>
              <p className='text-[8px] font-bold uppercase tracking-widest text-rose-600 mb-1'>Valid To</p>
              <p className='text-xs font-black text-rose-900'>{validTo}</p>
            </div>
          </div>
        </div>

        {/* Footer Design */}
        <div className='mt-12 flex items-center justify-between border-t border-slate-50 pt-6'>
          <div className='h-16 w-16 rounded-lg bg-slate-50 border-2 border-slate-100 flex items-center justify-center'>
            {/* Fake QR/Barcode element */}
            <div className='grid grid-cols-3 gap-1 opacity-20'>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-sm ${i % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
          <div className='text-center'>
            <div className='mb-1 h-8 w-24 bg-indigo-50/50 border border-indigo-100 rounded flex items-center justify-center rotate-[-5deg]'>
              <p className='text-[8px] font-black text-indigo-400 tracking-widest uppercase'>Verified</p>
            </div>
            <p className='text-[7px] font-bold uppercase text-slate-400'>Digitally Signed</p>
          </div>
        </div>
      </div>

      {/* Security Hologram */}
      <div className='absolute -right-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-slate-400/5 blur-xl' />
    </div>
  )
}

export default DocumentMockup
