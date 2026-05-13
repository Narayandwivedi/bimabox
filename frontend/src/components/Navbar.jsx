import { Link, useLocation } from 'react-router-dom'
import { getTheme } from '../context/ThemeContext'

const menuItems = [
  { name: 'Manage Vehicle', path: '/' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Setting', path: '/setting' },
]

const Navbar = () => {
  const location = useLocation()
  const theme = getTheme()

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 ${theme.navbar} z-50 transition-all duration-300`}>
      <div className='mx-auto flex h-16 max-w-screen-2xl items-center justify-center px-4'>
        {/* Logo Section - Centered */}
        <div className='flex items-center'>
          <Link to='/' className='flex items-center bg-white/10 px-4 py-1.5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all group'>
            <img
              src='/bimabox-Photoroom.avif'
              alt='BimaBox'
              className='h-12 w-auto drop-shadow-md transition-transform group-hover:scale-105'
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

