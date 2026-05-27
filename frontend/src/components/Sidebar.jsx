import { Link, useLocation } from 'react-router-dom'
import { getTheme } from '../context/ThemeContext'

const navIcons = {
  home: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
    </svg>
  ),
  search: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
    </svg>
  ),
  premium: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ),
  settings: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
    </svg>
  ),
}

const mainNavItems = [
  { name: 'Home', path: '/', icon: navIcons.home },
  { name: 'Search', path: '/rto-documents', icon: navIcons.search },
  { name: 'Premium', path: '/premium-calculator', icon: navIcons.premium },
  { name: 'Settings', path: '/setting', icon: navIcons.settings },
]

const NavLink = ({ item, isActive, children }) => (
  <Link
    to={item.path}
    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-600 shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    {children}
  </Link>
)

const Sidebar = () => {
  const location = useLocation()
  const theme = getTheme()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden w-[230px] flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur-sm lg:flex ${theme.navbar}`}
    >
      <div className='flex h-full flex-col'>
        <div className='flex-none border-b border-slate-100 px-5 py-5'>
          <Link to='/' className='flex items-center justify-center'>
            <img
              src='/bimabox-Photoroom.avif'
              alt='BimaBox'
              className='h-12 w-auto drop-shadow-sm'
            />
          </Link>
        </div>

        <div className='flex-1 overflow-y-auto px-3 py-5 scrollbar-thin'>
          <div className='mb-8'>
            <p className='mb-3 flex items-center gap-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400'>
              <span className='h-px flex-1 bg-slate-200' />
              <span>Navigation</span>
              <span className='h-px flex-1 bg-slate-200' />
            </p>
            <nav className='space-y-1'>
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <NavLink key={item.path} item={item} isActive={isActive}>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        <div className='flex-none border-t border-slate-100 p-4'>
          <div className='flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600'>
              BB
            </div>
            <div className='flex-1 min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-700'>BimaBox</p>
              <p className='truncate text-[11px] text-slate-400'>v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
