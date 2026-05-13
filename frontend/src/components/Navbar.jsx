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
      <div className='mx-auto flex h-16 lg:h-20 max-w-screen-2xl items-center px-4 lg:px-8'>
        {/* Logo Section - Left Aligned */}
        <div className='flex-none'>
          <Link to='/' className='flex items-center bg-white/10 px-4 lg:px-6 py-1.5 lg:py-2.5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all group'>
            <img
              src='/bimabox-Photoroom.avif'
              alt='BimaBox'
              className='h-12 lg:h-14 w-auto drop-shadow-md transition-transform group-hover:scale-105'
            />
          </Link>
        </div>

        {/* Desktop Menu - Rightish Center */}
        <div className='hidden lg:flex flex-1 justify-center items-center gap-10 ml-24'>
          {desktopMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[13px] font-bold tracking-[0.2em] uppercase transition-all hover:text-blue-600 hover:-translate-y-0.5 transform active:scale-95 ${
                isActive(item.path)
                  ? 'text-blue-600'
                  : 'text-slate-500'
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

