import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Login = () => {
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated, isAuthenticated, loading: authLoading } = useAuth()
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    name: '',
    email: '',
    mobile: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, authLoading, navigate])

  const switchMode = (newMode) => {
    if (newMode === mode) return
    setMode(newMode)
    setError('')
    setFormData({ identifier: '', password: '', name: '', email: '', mobile: '' })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.identifier || !formData.password) {
      setError('Please enter mobile number and password')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        identifier: formData.identifier,
        password: formData.password
      }, { withCredentials: true })

      if (response.data.success) {
        setUser(response.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    const { name, email, password } = formData
    if (!name || !email || !password) {
      setError('Name, email, and password are required')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name, email, password
      }, { withCredentials: true })

      if (response.data.success) {
        setUser(response.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(response.data.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      }, { withCredentials: true })

      if (response.data.success) {
        setUser(response.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(response.data.message || 'Google login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign In was unsuccessful. Try again later')
  }

  if (authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <div className='flex flex-col items-center justify-center'>
            <svg className='animate-spin h-12 w-12 text-orange-600 mb-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <p className='text-gray-600 font-semibold'>Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0'>
        <div className='absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full blur-3xl'></div>
      </div>

      <div className='w-full max-w-md z-10'>
        <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20'>
          <div className='text-center mb-6'>
            <div className='mb-4'>
              <img src='/bimabox-Photoroom.avif' alt='BimaBox Logo' className='h-16 mx-auto drop-shadow-md' />
            </div>

            {/* Login / Sign Up Tabs */}
            <div className='flex bg-slate-100 rounded-xl p-1 mb-4'>
              <button
                type='button'
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button
                type='button'
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>

            {mode === 'login' ? (
              <p className='text-slate-500 text-xs'>Enter your credentials to access BimaBox</p>
            ) : (
              <p className='text-slate-500 text-xs'>Create your BimaBox account</p>
            )}
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake'>
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <p className='text-sm text-red-800 font-medium'>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className='space-y-3.5'>
            {mode === 'signup' && (
              <>
                <div>
                  <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>Full Name</label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                      <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                      </svg>
                    </div>
                    <input type='text' name='name' value={formData.name} onChange={handleChange} placeholder='John Doe' className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium' disabled={loading} />
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>Email</label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                      <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                    </div>
                    <input type='email' name='email' value={formData.email} onChange={handleChange} placeholder='john@example.com' className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium' disabled={loading} />
                  </div>
                </div>
              </>
            )}

            {mode === 'login' && (
              <div>
                <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>Mobile Number</label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                    <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <input type='text' name='identifier' value={formData.identifier} onChange={handleChange} placeholder='Email or Mobile' className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium' disabled={loading} />
                </div>
              </div>
            )}

            <div>
              <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>Password</label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                  <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <input type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange} placeholder='••••••••' className='w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium' disabled={loading} />
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors'>
                  {showPassword ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type='submit' disabled={loading} className='w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4'>
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  <span>{mode === 'login' ? 'Verifying...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-200'></div>
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-slate-400 font-bold tracking-widest'>Or continue with</span>
              </div>
            </div>

            <div className='flex justify-center'>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap theme="outline" size="large" shape="pill" width="100%" />
            </div>
          </form>

          <div className='mt-4 text-center'>
            <p className='text-xs text-slate-400 font-semibold'>
              All your policies. One Smart Place.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Login
