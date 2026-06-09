import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className='min-h-screen bg-slate-100 px-4 pb-32 pt-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-lg lg:max-w-3xl'>
        <div className='mb-5'>
          <h1 className='text-xl font-black text-slate-900'>Settings</h1>
          <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>Account Preferences</p>
        </div>

        <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0'>
          {/* Profile Card */}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:self-start'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='h-12 w-12 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden text-lg text-white font-black shadow-md'>
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className='h-full w-full object-cover' />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className='min-w-0 flex-1'>
                {editingName ? (
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className='flex-1 px-3 py-1.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                      autoFocus
                      disabled={savingName}
                    />
                    <button type='button' onClick={handleSaveName} disabled={savingName || !nameInput.trim()} className='px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer'>
                      {savingName ? '...' : 'Save'}
                    </button>
                    <button type='button' onClick={handleCancelName} disabled={savingName} className='px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer'>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button type='button' onClick={() => { setNameInput(user?.name || ''); setEditingName(true) }} className='group flex items-center gap-2 cursor-pointer'>
                    <h2 className='text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors'>{user?.name || 'User'}</h2>
                    <svg className='h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                    </svg>
                  </button>
                )}
                <p className='text-[9px] font-bold text-indigo-600 uppercase tracking-widest'>Active Member</p>
              </div>
            </div>

            <div className='space-y-2.5 md:grid md:grid-cols-2 md:gap-2.5 md:space-y-0'>
              <div className='flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100'>
                <svg className='h-4 w-4 shrink-0 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                </svg>
                <span className='text-xs font-semibold text-slate-900'>{user?.mobile || 'Not linked'}</span>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100'>
                <svg className='h-4 w-4 shrink-0 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
                <span className='text-xs font-semibold text-slate-900'>{user?.email || 'Not linked'}</span>
              </div>
            </div>
          </div>

          {/* References Card */}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:self-start'>
            <h3 className='text-xs font-black uppercase tracking-widest text-slate-500 mb-4'>Manage Data</h3>
            <button
              onClick={() => navigate('/references')}
              className='flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer'
            >
              <svg className='h-5 w-5 shrink-0 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' />
              </svg>
              <div className='min-w-0 text-left'>
                <p className='text-xs font-bold text-slate-900'>References</p>
                <p className='text-[9px] font-semibold text-slate-400'>Manage reference names used in insurance</p>
              </div>
              <svg className='h-4 w-4 ml-auto shrink-0 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>

          {/* Contact & Social Card */}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h3 className='text-xs font-black uppercase tracking-widest text-slate-500 mb-4'>Get In Touch</h3>

            <div className='space-y-2.5 mb-5 md:grid md:grid-cols-2 md:gap-2.5 md:space-y-0'>
              <a href='mailto:mybimabox@gmail.com' className='flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group'>
                <svg className='h-4 w-4 shrink-0 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Email</p>
                  <p className='text-xs font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate'>mybimabox@gmail.com</p>
                </div>
              </a>
              <a href='tel:+917004534508' className='flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group'>
                <svg className='h-4 w-4 shrink-0 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                </svg>
                <div className='min-w-0'>
                  <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>Mobile</p>
                  <p className='text-xs font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors'>+91 7004534508</p>
                </div>
              </a>
            </div>

            <div>
              <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3'>Follow Us</p>
              <div className='flex items-center gap-3'>
                <a
                  href='https://www.instagram.com/bimabox.in/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-90'
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
                  className='flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90'
                  aria-label='Facebook'
                >
                  <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <button
            onClick={handleLogout}
            className='flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 py-3.5 text-xs font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98]'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
