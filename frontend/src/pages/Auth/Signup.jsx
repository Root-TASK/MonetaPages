import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Card, Spinner } from '../../components/UI'
import { TrendingUp, Mail, Lock, User, PlusCircle } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signup(email, password, fullName)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', padding: '1rem' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/m-icon.png" alt="Moneta Logo" style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 16 }} />
          <h1 className="grad-text" style={{ fontSize: '28px', fontWeight: 800 }}>Moneta Bank</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Join our exclusive financial circle</p>
        </div>

        <Card glass style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Full name"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              disabled={loading}
              icon={<User size={16} />}
            />
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
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              icon={<Lock size={16} />}
            />
            
            {error && <div style={{ fontSize: '13px', color: 'var(--red)', background: 'var(--red-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--red-border)' }}>{error}</div>}

            <Button type="submit" disabled={loading} style={{ width: '100%', height: 48, marginTop: 12 }}>
              {loading ? <Spinner size={18} color="#fff" /> : <>Get Started <PlusCircle size={18} style={{ marginLeft: 8 }} /></>}
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
