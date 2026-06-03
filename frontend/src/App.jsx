import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Setting from './pages/Setting'
import RTODocuments from './pages/RTODocuments'
import RTODocumentDetail from './pages/RTODocumentDetail'
import Search from './pages/Search'
import BottomNavigation from './components/BottomNavigation'
import PremiumCalculator from './pages/PremiumCalculator'
import KycPage from './pages/Kyc/KycPage'
import { getTheme } from './context/ThemeContext'

import { Agentation } from "agentation";



function AppContent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const showNav = !isLoginPage
  const theme = getTheme()

  return (
    <>
      <ToastContainer />
      {showNav && <Sidebar />}

      {showNav && (
        <nav className={`fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-center border-b border-slate-200 lg:hidden ${theme.navbar}`}>
          <Link to='/' className='flex items-center gap-1.5'>
            <img src='/bimalogo.png' alt='BimaBox' className='h-12 w-auto' />
            <div className='flex flex-col'>
              <span className='text-xl font-bold leading-none' style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className='text-slate-800'>Bima</span><span style={{ color: '#003afd' }}>Box</span>
              </span>
              <span className='mt-px text-[6px] font-medium tracking-wide' style={{ color: '#0c1f48', fontFamily: "'Inter', sans-serif" }}>All your policies. One smart place.</span>
            </div>
          </Link>
        </nav>
      )}

      <div className={showNav ? 'lg:ml-[230px]' : ''}>
        <div className={showNav ? 'pt-16 pb-20 lg:pt-0 lg:pb-0' : ''}>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/setting' element={<ProtectedRoute><Setting /></ProtectedRoute>} />
            <Route path='/search' element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path='/rto-documents' element={<ProtectedRoute><RTODocuments /></ProtectedRoute>} />
            <Route path='/rto-documents/:type/:id' element={<ProtectedRoute><RTODocumentDetail /></ProtectedRoute>} />
            <Route path='/premium-calculator' element={<ProtectedRoute><PremiumCalculator /></ProtectedRoute>} />
            <Route path='/kyc' element={<ProtectedRoute><KycPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
      {<Agentation />}
      {showNav && <BottomNavigation />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
