import { Link, useLocation } from 'react-router-dom'
import { getTheme } from '../context/ThemeContext'

const desktopMenuItems = [
  { name: 'Home', path: '/' },
  { name: 'Premium', path: '/premium-calculator' },
  { name: 'Settings', path: '/setting' },
]

const Navbar = () => {
  const location = useLocation()
  const theme = getTheme()

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 ${theme.navbar} z-50 transition-all duration-300`}>
      <div className='mx-auto flex h-16 lg:h-20 max-w-screen-2xl items-center px-4 lg:px-48'>
        {/* Logo Section - Left Aligned with offset */}
        <div className='flex-none'>
          <Link to='/' className='flex items-center gap-1.5'>
            <img src='/bimalogo.png' alt='BimaBox' className='h-[53px] w-auto' />
            <div className='flex flex-col'>
              <span className='text-[22px] font-bold leading-none lg:pt-0.5' style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className='text-slate-800'>Bima</span><span style={{ color: '#003afd' }}>Box</span>
              </span>
              <span className='mt-0.5 text-[6.5px] font-medium tracking-wide' style={{ color: '#0c1f48', fontFamily: "'Inter', sans-serif" }}>All your policies. One smart place.</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu - Rightish Center */}
        <div className='hidden lg:flex flex-1 justify-center items-center gap-10 ml-24 font-inter'>
          {desktopMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-all hover:text-blue-600 hover:-translate-y-0.5 transform active:scale-95 ${
                isActive(item.path)
                  ? 'text-blue-600'
                  : 'text-slate-600'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Right Spacer to ensure 'rightish' center */}
        <div className='hidden lg:block w-48'></div>
      </div>
    </nav>
  )
}

export default Navbar

