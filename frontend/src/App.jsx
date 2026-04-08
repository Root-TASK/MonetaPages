import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Clients from './pages/Clients'
import Calendar from './pages/Tools/Calendar'
import TaskHub from './pages/Tools/TaskHub'
import Calculator from './components/Calculator'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import { fetchSummary } from './utils/api'
import { fmtCurrency } from './utils/format'
import { Toaster } from 'react-hot-toast'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" />
  return children
}

function MainLayout() {
  const [balance, setBalance] = useState('—')
  const [balColor, setBalColor] = useState('var(--text-primary)')
  const loc = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSummary()
        .then(s => {
          setBalance(fmtCurrency(s.closing_balance))
          setBalColor(s.closing_balance >= 0 ? 'var(--green)' : 'var(--red)')
        })
        .catch(() => {})
    }
  }, [loc.pathname, user])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-card)' }}>
      <Sidebar balance={balance} balanceColor={balColor} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '80px', // Space for mobile BottomNav
      }}>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/ledger"   element={<Ledger />} />
          <Route path="/reports"  element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile"  element={<Profile />} />
          <Route path="/clients"  element={<Clients />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks"    element={<TaskHub />} />
          <Route path="*"         element={<Navigate to="/" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
      </Routes>
      <Calculator />
    </AuthProvider>
  )
}
