import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='border-t border-slate-200 bg-slate-50 py-12 px-4 md:px-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-1.5'>
            <img src='/bimalogo.png' alt='BimaBox' className='h-[40px] w-auto' />
            <div className='flex flex-col'>
              <span className='text-base font-bold leading-none' style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className='text-slate-800'>Bima</span><span style={{ color: '#003afd' }}>Box</span>
              </span>
            </div>
          </div>
          <div className='flex items-center gap-6'>
            <Link to='/contact-us' className='text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors'>Contact Us</Link>
            <Link to='/privacy-policy' className='text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors'>Privacy Policy</Link>
            <Link to='/terms-and-conditions' className='text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors'>Terms & Conditions</Link>
          </div>
        </div>
        <div className='mt-8 pt-6 border-t border-slate-200 text-center'>
          <p className='text-xs text-slate-400 font-medium'>© 2025 BimaBox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
