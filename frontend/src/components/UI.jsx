import React from 'react'
import { createPortal } from 'react-dom'

// ── Badge ────────────────────────────────────────────────────────
const BADGE_STYLES = {
  income:  { bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'var(--green-border)' },
  expense: { bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'var(--red-border)' },
  client:   { bg: 'var(--blue-bg)',   color: 'var(--blue)',   border: 'var(--blue-border)' },
  company:  { bg: 'var(--amber-bg)',  color: 'var(--amber)',  border: 'var(--amber-border)' },
  personal: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
}
export function Badge({ text, variant }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.client
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: 600,
      textTransform: 'capitalize', whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {text}
    </span>
  )
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, glass, noPadding }) {
  return (
    <div
      onClick={onClick}
      className={glass ? 'glass' : ''}
      style={{
        background: glass ? 'var(--glass)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: noPadding ? 0 : '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, accent, icon }) {
  return (
    <div
      className="glass"
      style={{
        background: 'var(--glass)',
        border: `1px solid ${accent ? accent + '44' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        flex: 1,
        minWidth: '140px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {accent && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 40, height: 40,
          background: accent, filter: 'blur(25px)', opacity: 0.15, zIndex: 0
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.4px' }}>{label}</div>
          {icon && <div style={{ color: accent || 'var(--text-muted)', opacity: 0.8 }}>{icon}</div>}
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: color || 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.8, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Button ───────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, type = 'button' }) {
  const sizes = { sm: '8px 16px', md: '10px 24px', lg: '14px 32px' }
  const variants = {
    primary:   { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', border: 'transparent', shadow: 'var(--accent-glow)' },
    secondary: { bg: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'var(--border-strong)', shadow: 'transparent' },
    danger:    { bg: 'var(--red-bg)', color: 'var(--red)', border: 'var(--red-border)', shadow: 'var(--red-glow)' },
    ghost:     { bg: 'transparent', color: 'var(--text-secondary)', border: 'var(--border)', shadow: 'transparent' },
  }
  const v = variants[variant] || variants.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={variant === 'primary' ? 'pulse' : ''}
      style={{
        padding: sizes[size],
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 'var(--radius-md)',
        fontSize: size === 'sm' ? '12px' : '14px',
        fontWeight: 600, display: 'inline-flex',
        alignItems: 'center', gap: '8px',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: variant === 'primary' ? `0 4px 14px 0 ${v.shadow}` : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────
export function Input({ label, error, icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: 4, letterSpacing: '0.2px' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && <div style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 2 }}>{icon}</div>}
        <input 
          {...props} 
          style={{ 
            paddingLeft: icon ? 40 : 16,
            borderColor: error ? 'var(--red)' : undefined,
            height: '44px',
            ...props.style 
          }} 
        />
      </div>
      {error && <span style={{ fontSize: '11px', color: 'var(--red)', marginLeft: 4 }}>{error}</span>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: 4 }}>{label}</label>}
      <select {...props}>{children}</select>
    </div>
  )
}

// ── Toggle Group ─────────────────────────────────────────────────
export function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: '8px 12px',
              background: active ? 'var(--bg-card)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px', fontWeight: active ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Capsule Select ───────────────────────────────────────────────
export function CapsuleSelect({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              background: active ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: active ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '24px',
              fontSize: '12px', fontWeight: active ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Loading Spinner ──────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Empty State ──────────────────────────────────────────────────
export function EmptyState({ icon = '📒', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '36px', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16 }}>{description}</div>}
      {action}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────
export function ProgressBar({ value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = '520px' }) {
  if (!open) return null
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-up glass"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          width: '100%', maxWidth,
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
          boxShadow: 'var(--glass-shadow)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingRight: 10 }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)', 
              borderRadius: '50%', width: 28, height: 28, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              fontSize: '18px', lineHeight: 1, marginTop: -4, marginRight: -4
            }}>×</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

import { fetchSecureFile } from '../utils/api'

// ── Table ────────────────────────────────────────────────────────
export function Table({ headers, children, stickyHeader = false }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 12px',
                textAlign: i >= headers.length - 2 ? 'right' : 'left',
                fontSize: '11px', fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                background: stickyHeader ? 'var(--bg-card)' : 'transparent',
                position: stickyHeader ? 'sticky' : 'static',
                top: 0, zIndex: 1,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

// ── Secure Image ────────────────────────────────────────────────
export function SecureImage({ filename, alt, style = {}, ...props }) {
  const [url, setUrl] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (!filename) return
    let active = true
    setLoading(true)
    setError(false)

    fetchSecureFile(filename)
      .then(blob => {
        if (!active) return
        const objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setLoading(false)
      })
      .catch(err => {
        if (!active) return
        console.error("Failed to load secure image:", err)
        setError(true)
        setLoading(false)
      })

    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [filename])

  if (!filename) return null
  if (loading) return <div style={{ width: 100, height: 100, background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>
  if (error) return <div style={{ padding: 12, fontSize: '11px', color: 'var(--red)', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)' }}>Failed to load receipt</div>

  return <img src={url} alt={alt} style={style} {...props} />
}
