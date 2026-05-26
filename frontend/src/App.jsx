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
import VehicleRegistration from './pages/VehicleRegistration/VehicleRegistration'
import VehicleDetailPage from './pages/VehicleRegistration/VehicleDetailPage'
import RTODocuments from './pages/RTODocuments'
import RTODocumentDetail from './pages/RTODocumentDetail'
import BottomNavigation from './components/BottomNavigation'
import PremiumCalculator from './pages/PremiumCalculator'
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
          <Link to='/'>
            <img
              src='/bimabox-Photoroom.avif'
              alt='BimaBox'
              className='h-12 w-auto drop-shadow-md'
            />
          </Link>
        </nav>
      )}

      <div className={showNav ? 'lg:ml-64' : ''}>
        <div className={showNav ? 'pt-16 pb-20 lg:pt-0 lg:pb-0' : ''}>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/setting' element={<ProtectedRoute><Setting /></ProtectedRoute>} />
            <Route path='/vehicle' element={<ProtectedRoute><VehicleRegistration /></ProtectedRoute>} />
            <Route path='/vehicle/:id/detail' element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />
            <Route path='/rto-documents' element={<ProtectedRoute><RTODocuments /></ProtectedRoute>} />
            <Route path='/rto-documents/:type/:id' element={<ProtectedRoute><RTODocumentDetail /></ProtectedRoute>} />
            <Route path='/premium-calculator' element={<ProtectedRoute><PremiumCalculator /></ProtectedRoute>} />
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
