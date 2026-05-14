import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Setting = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-slate-100 px-4 pb-32 pt-4 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-black text-slate-900'>Settings</h1>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>Account Preferences</p>
        </div>

        <div className='space-y-6'>
          {/* Profile Card */}
          <div className='rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.15)] md:p-8'>
            <div className='flex flex-col items-center gap-3 mb-8 text-center'>
              <div className='h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden text-xl text-white font-black shadow-lg shadow-indigo-100'>
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className='h-full w-full object-cover' />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <h2 className='text-lg font-black text-slate-900'>{user?.name || 'User'}</h2>
                <p className='text-[10px] font-bold text-indigo-600 uppercase tracking-widest'>Active Member</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='rounded-2xl bg-white p-4 border border-slate-100'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>Mobile Number</p>
                <p className='text-sm font-semibold text-slate-900'>{user?.mobile || 'Not linked'}</p>
              </div>
              
              <div className='rounded-2xl bg-white p-4 border border-slate-100'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>Email Address</p>
                <p className='text-sm font-semibold text-slate-900'>{user?.email || 'Not linked'}</p>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className='rounded-[32px] border border-rose-100 bg-rose-50/50 p-6 shadow-[0_10px_30px_-15px_rgba(225,29,72,0.1)]'>
            <button
              onClick={handleLogout}
              className='flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-[0.98]'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
              </svg>
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Setting
