import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Card, Button, Input, Spinner } from '../components/UI'
import { fetchOpeningBalance, updateOpeningBalance, fetchSmtpSettings, updateSmtpSettings, fetchBudgetSummary, setBudget } from '../utils/api'
import { fmtCurrency, fmtShort } from '../utils/format'
import { Mail, Globe, Shield, User, Save, AlertTriangle, Target, Info } from 'lucide-react'

export default function Settings() {
  const [ob, setOb] = useState(0)
  const [obInput, setObInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [smtp, setSmtp] = useState({
    smtp_server: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    recipient_email: ''
  })
  const [smtpLoading, setSmtpLoading] = useState(true)
  const [savingSmtp, setSavingSmtp] = useState(false)

  // Budgeting state
  const [budgets, setBudgets] = useState({
    client: 0,
    company: 0,
    personal: 0
  })
  const [savingBudget, setSavingBudget] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchOpeningBalance(),
      fetchSmtpSettings(),
      fetchBudgetSummary(new Date().toISOString().slice(0, 7))
    ]).then(([obData, smtpData, budgetData]) => {
      setOb(obData.opening_balance)
      setObInput(String(obData.opening_balance))
      setSmtp(smtpData)
      
      const bMap = { client: 0, company: 0, personal: 0 }
      budgetData.forEach(b => { if (b.category in bMap) bMap[b.category] = b.budget })
      setBudgets(bMap)
      
      setSmtpLoading(false)
    }).catch(e => {
      toast.error('Failed to load settings')
      setSmtpLoading(false)
    })
  }, [])

  const saveOb = async () => {
    const val = parseFloat(obInput)
    if (isNaN(val) || val < 0) { toast.error('Enter a valid amount'); return }
    setSaving(true)
    try {
      await updateOpeningBalance(val)
      setOb(val)
      setEditing(false)
      toast.success('Opening balance updated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveSmtp = async () => {
    setSavingSmtp(true)
    try {
      await updateSmtpSettings(smtp)
      toast.success('SMTP settings saved!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingSmtp(false)
    }
  }

  const saveBudget = async (category, amount) => {
    setSavingBudget(true)
    const month = new Date().toISOString().slice(0, 7)
    try {
      await setBudget({ category, amount: parseFloat(amount), month })
      toast.success(`${category} budget updated`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingBudget(false)
    }
  }

  return (
    <div className="fade-up" style={{ padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>Configure your Moneta Bank account</p>
      </div>

      {/* Opening Balance */}
      <Card style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 4 }}>Opening Balance</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          The starting balance for your ledger. All running balances are computed from this value.
        </p>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="number"
              value={obInput}
              onChange={e => setObInput(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{ maxWidth: 220 }}
              autoFocus
            />
            <Button onClick={saveOb} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setObInput(String(ob)) }}>Cancel</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              ₹{fmtCurrency(ob)}
            </span>
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        )}
      </Card>

      {/* Monthly Budgets */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <Target size={18} color="var(--accent)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Monthly Budget Targets</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Set your spending limits for each category to track performance on the dashboard.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['client', 'company', 'personal'].map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{cat} Target</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  value={budgets[cat]}
                  onChange={e => setBudgets({ ...budgets, [cat]: e.target.value })}
                  placeholder="0.00"
                  style={{ width: 100, fontSize: '13px', padding: '6px 10px' }}
                />
                <Button size="sm" onClick={() => saveBudget(cat, budgets[cat])} disabled={savingBudget}>
                  <Save size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Info size={14} color="var(--accent)" style={{ marginTop: 2 }} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Targets configured here apply to the <strong>current month ({new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })})</strong> and will be used to calibrate your dashboard indicators.
          </p>
        </div>
      </Card>

      {/* SMTP Configuration */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <Mail size={18} color="var(--accent)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>SMTP Configuration</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Configure your email server to send financial reports via email.
        </p>

        {smtpLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}><Spinner /></div>
        ) : (
          <div className="flex-col gap-4">
            <div className="grid-2">
              <Input
                label="SMTP Server"
                placeholder="smtp.gmail.com"
                icon={<Globe size={14} />}
                value={smtp.smtp_server}
                onChange={e => setSmtp({ ...smtp, smtp_server: e.target.value })}
              />
              <Input
                label="Port"
                placeholder="587"
                type="number"
                value={smtp.smtp_port}
                onChange={e => setSmtp({ ...smtp, smtp_port: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid-2">
              <Input
                label="Username"
                autoComplete="off"
                icon={<User size={14} />}
                value={smtp.smtp_user}
                onChange={e => setSmtp({ ...smtp, smtp_user: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                icon={<Shield size={14} />}
                value={smtp.smtp_password}
                onChange={e => setSmtp({ ...smtp, smtp_password: e.target.value })}
              />
            </div>
            <div className="grid-2">
              <Input
                label="Sender Email"
                placeholder="no-reply@moneta.com"
                value={smtp.smtp_from_email}
                onChange={e => setSmtp({ ...smtp, smtp_from_email: e.target.value })}
              />
              <Input
                label="Default Recipient"
                placeholder="your@email.com"
                value={smtp.recipient_email}
                onChange={e => setSmtp({ ...smtp, recipient_email: e.target.value })}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <Button onClick={saveSmtp} disabled={savingSmtp} style={{ width: '100%' }}>
                <Save size={16} style={{ marginRight: 8 }} /> {savingSmtp ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* About */}
      <Card style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 4 }}>About Moneta Bank</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Moneta Bank is a full-stack financial ledger application built with React + Vite (frontend)
          and FastAPI + SQLite (backend). It supports income/expense tracking, client/company expense
          categorisation, receipt screenshots, monthly and daily reporting, and CSV export.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Frontend', 'React 18 · Vite · Recharts · React Router'],
            ['Backend', 'FastAPI · SQLAlchemy · SQLite · Pydantic v2'],
            ['Version', '1.0.0'],
            ['API Docs', 'http://localhost:8000/docs'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16, fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>{k}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {k === 'API Docs'
                  ? <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{v}</a>
                  : v
                }
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ border: '1px solid var(--red-border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
          <AlertTriangle size={18} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>Danger Zone</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Use the FastAPI admin at <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>localhost:8000/docs</a> to
              bulk-delete transactions or manage the database directly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
