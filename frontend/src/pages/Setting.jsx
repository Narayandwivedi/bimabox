import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Setting = () => {
  const navigate = useNavigate()
  const { logout, user, setUser } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    try {
      const response = await axios.put(`${API_URL}/api/auth/name`, { name: nameInput.trim() }, { withCredentials: true })
      if (response.data.success) {
        setUser(response.data.data.user)
        setEditingName(false)
      }
    } catch (_err) {
    } finally {
      setSavingName(false)
    }
  }

  const handleCancelName = () => {
    setNameInput(user?.name || '')
    setEditingName(false)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-32 pt-6 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-lg'>
        {/* Header */}
        <div className='mb-6 animate-fadeIn'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20'>
              <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-black text-slate-900'>Settings</h1>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Account Preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className='animate-slideUp mb-4'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-6'>
            <div className='flex items-center gap-4'>
              <div className='relative h-14 w-14 shrink-0'>
                <div className='h-full w-full rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden text-xl text-white font-black shadow-lg shadow-indigo-500/25'>
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className='h-full w-full object-cover' />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className='absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500' />
              </div>
              <div className='min-w-0 flex-1'>
                {editingName ? (
                  <div className='flex flex-wrap items-center gap-2'>
                    <input
                      type='text'
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className='flex-1 min-w-[120px] px-3 py-1.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                      autoFocus
                      disabled={savingName}
                    />
                    <div className='flex items-center gap-1.5'>
                      <button type='button' onClick={handleSaveName} disabled={savingName || !nameInput.trim()} className='px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer'>
                        {savingName ? (
                          <svg className='h-3.5 w-3.5 animate-spin' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                          </svg>
                        ) : 'Save'}
                      </button>
                      <button type='button' onClick={handleCancelName} disabled={savingName} className='px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer'>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type='button' onClick={() => { setNameInput(user?.name || ''); setEditingName(true) }} className='group flex items-center gap-2 cursor-pointer'>
                    <h2 className='text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors'>{user?.name || 'User'}</h2>
                    <svg className='h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                    </svg>
                  </button>
                )}
                <div className='flex items-center gap-1.5 mt-0.5'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  <p className='text-[9px] font-bold text-emerald-600 uppercase tracking-widest'>Active Member</p>
                </div>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
              <div className='flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 border border-slate-100'>
                <div className='h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0'>
                  <svg className='h-4 w-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Mobile</p>
                  <p className='text-xs font-semibold text-slate-900 truncate'>{user?.mobile || 'Not linked'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 border border-slate-100'>
                <div className='h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0'>
                  <svg className='h-4 w-4 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Email</p>
                  <p className='text-xs font-semibold text-slate-900 truncate'>{user?.email || 'Not linked'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manage Data Card */}
        <div className='mb-4 animate-slideUp'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center'>
                <svg className='h-3.5 w-3.5 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
                </svg>
              </div>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>Manage Data</h3>
            </div>
            <button
              onClick={() => navigate('/references')}
              className='group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-indigo-200 hover:from-indigo-50/50 hover:to-indigo-50/30 transition-all duration-200 cursor-pointer'
            >
              <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-shadow'>
                <svg className='h-5 w-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' />
                </svg>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors'>References</p>
                <p className='text-[10px] font-semibold text-slate-400'>Manage reference names used in insurance</p>
              </div>
              <svg className='h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>

        {/* Contact & Social Card */}
        <div className='mb-4 animate-slideUp'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-7 w-7 rounded-lg bg-rose-50 flex items-center justify-center'>
                <svg className='h-3.5 w-3.5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                </svg>
              </div>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>Get In Touch</h3>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5'>
              <a href='mailto:mybimabox@gmail.com' className='group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-blue-200 hover:from-blue-50/50 hover:to-blue-50/30 transition-all duration-200'>
                <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15'>
                  <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Email</p>
                  <p className='text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate'>mybimabox@gmail.com</p>
                </div>
              </a>
              <a href='tel:+917004534508' className='group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-emerald-200 hover:from-emerald-50/50 hover:to-emerald-50/30 transition-all duration-200'>
                <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/15'>
                  <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Mobile</p>
                  <p className='text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors'>+91 7004534508</p>
                </div>
              </a>
            </div>

            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-1.5 w-1.5 rounded-full bg-slate-300' />
                <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Follow Us</p>
              </div>
              <div className='flex items-center gap-3'>
                <a
                  href='https://www.instagram.com/bimabox.in/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center h-11 w-11 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-500 hover:border-pink-200 hover:from-pink-50 hover:to-pink-50 hover:text-pink-600 hover:shadow-lg hover:shadow-pink-500/15 transition-all duration-200 active:scale-90'
                  aria-label='Instagram'
                >
                  <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' />
                  </svg>
                </a>
                <a
                  href='https://www.facebook.com/profile.php?viewas=100000686899395&id=61590698249898'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center h-11 w-11 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-500 hover:border-blue-200 hover:from-blue-50 hover:to-blue-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/15 transition-all duration-200 active:scale-90'
                  aria-label='Facebook'
                >
                  <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Support Card */}
        <div className='mb-4 animate-slideUp'>
          <div className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center'>
                <svg className='h-3.5 w-3.5 text-violet-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                </svg>
              </div>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>Legal &amp; Support</h3>
            </div>
            <div className='space-y-2.5'>
              {/* Contact Us */}
              <Link
                to='/contact-us'
                className='group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-rose-200 hover:from-rose-50/50 hover:to-rose-50/30 transition-all duration-200'
              >
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-shadow'>
                  <svg className='h-5 w-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors'>Contact Us</p>
                  <p className='text-[10px] font-semibold text-slate-400'>Get help, send feedback, or reach our team</p>
                </div>
                <svg className='h-4 w-4 shrink-0 text-slate-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>

              {/* Privacy Policy */}
              <Link
                to='/privacy-policy'
                className='group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-blue-200 hover:from-blue-50/50 hover:to-blue-50/30 transition-all duration-200'
              >
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow'>
                  <svg className='h-5 w-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors'>Privacy Policy</p>
                  <p className='text-[10px] font-semibold text-slate-400'>How we collect, use, and protect your data</p>
                </div>
                <svg className='h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>

              {/* Terms & Conditions */}
              <Link
                to='/terms-and-conditions'
                className='group flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 border border-slate-100 hover:border-violet-200 hover:from-violet-50/50 hover:to-violet-50/30 transition-all duration-200'
              >
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-shadow'>
                  <svg className='h-5 w-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors'>Terms &amp; Conditions</p>
                  <p className='text-[10px] font-semibold text-slate-400'>Rules and guidelines for using BimaBox</p>
                </div>
                <svg className='h-4 w-4 shrink-0 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className='animate-slideUp'>
          <button
            onClick={handleLogout}
            className='group flex w-full items-center justify-center gap-3 rounded-[32px] border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-50/50 py-4 text-xs font-black uppercase tracking-widest text-rose-600 transition-all hover:from-rose-100 hover:to-rose-100 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]'
          >
            <svg className='h-4 w-4 transition-transform group-hover:translate-x-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
            </svg>
            Logout Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Setting
