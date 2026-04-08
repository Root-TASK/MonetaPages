import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, Button, Badge } from '../components/UI'
import { User, Mail, LogOut, ShieldCheck, Calendar, Wallet } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="fade-up" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: '50%', 
          background: 'var(--bg-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem', padding: 12
        }}>
          <img src="/m-icon.png" alt="User Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{user.full_name || 'Personal Account'}</h1>
        <Badge text="Moneta Bank Elite" variant="client" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{user.email}</div>
          </div>
        </Card>

        <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Member Since</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
          </div>
        </Card>

        <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Security Status</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--green)' }}>Verified & Protected</div>
          </div>
        </Card>

        <div style={{ marginTop: '1.5rem' }}>
          <Button variant="danger" onClick={logout} style={{ width: '100%', height: 50, borderRadius: '14px' }}>
            <LogOut size={20} style={{ marginRight: 8 }} /> Sign Out
          </Button>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Moneta Bank v1.1.0 · Personal Financial Command Center
          </p>
        </div>
      </div>
    </div>
  )
}
