import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/UI'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Auditorios     from './pages/Auditorios'
import Conferencistas from './pages/Conferencistas'
import Reservas       from './pages/Reservas'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"               element={<Login />} />
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/auditorios"     element={<PrivateRoute><Auditorios /></PrivateRoute>} />
        <Route path="/conferencistas" element={<PrivateRoute><Conferencistas /></PrivateRoute>} />
        <Route path="/reservas"       element={<PrivateRoute><Reservas /></PrivateRoute>} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
