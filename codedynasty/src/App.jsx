import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useAppConfig } from './hooks/useAppConfig'
import NavBar from './components/NavBar'
import Banner from './components/Banner'
import MaintenanceScreen from './components/MaintenanceScreen'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function AppInner() {
  const { config, loading } = useAppConfig()

  if (loading) return null

  // 🔧 AppConfig flag: maintenance_mode — flips the whole app
  if (config.maintenance_mode) return <MaintenanceScreen />

  return (
    <>
      {/* 🔧 AppConfig flag: show_new_banner */}
      {config.show_new_banner && <Banner />}
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
