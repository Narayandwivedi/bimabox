import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Login = () => {
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated, isAuthenticated, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
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
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        // Update auth context
        setUser(response.data.data.user)
        setIsAuthenticated(true)

        // Redirect to home/dashboard
        navigate('/')
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
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
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        setUser(response.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(response.data.message || 'Google login failed')
      }
    } catch (err) {
      console.error('Google login error:', err)
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
      {/* Abstract Background Shapes */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0'>
        <div className='absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full blur-3xl'></div>
      </div>

      <div className='w-full max-w-md z-10'>
        <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20'>
          <div className='text-center mb-6'>
            <div className='mb-4'>
              <img 
                src='/bimabox-Photoroom.avif' 
                alt='BimaBox Logo' 
                className='h-16 mx-auto drop-shadow-md'
              />
            </div>
            <h1 className='text-2xl font-black text-slate-800 mb-1'>Sign In</h1>
            <p className='text-slate-500 text-xs'>Enter your credentials to access BimaBox</p>
          </div>

          {/* Error Message */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className='space-y-3.5'>
            <div>
              <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>
                Mobile Number
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                  <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <input
                  type='text'
                  name='identifier'
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder='10-digit mobile number'
                  className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium'
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 ml-1'>
                Password
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500'>
                  <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-medium'
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                  </svg>
                </>
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                width="100%"
              />
            </div>
          </form>

          {/* Footer */}
          <div className='mt-4 text-center'>
            <p className='text-xs text-slate-400 font-medium uppercase tracking-widest'>
              © {new Date().getFullYear()} BimaBox • Secure Insurance Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
