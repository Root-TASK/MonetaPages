import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Card, Spinner } from '../../components/UI'
import { TrendingUp, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', padding: '1rem' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/m-icon.png" alt="Moneta Logo" style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 16 }} />
          <h1 className="grad-text" style={{ fontSize: '28px', fontWeight: 800 }}>Moneta Bank</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Secure Digital Financial Command</p>
        </div>

        <Card glass style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              icon={<Mail size={16} />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              icon={<Lock size={16} />}
            />
            
            {error && <div style={{ fontSize: '13px', color: 'var(--red)', background: 'var(--red-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--red-border)' }}>{error}</div>}

            <Button type="submit" disabled={loading} style={{ width: '100%', height: 48, marginTop: 12 }}>
              {loading ? <Spinner size={18} color="#fff" /> : <>Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} /></>}
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one for free</Link>
        </p>
      </div>
    </div>
  )
}
