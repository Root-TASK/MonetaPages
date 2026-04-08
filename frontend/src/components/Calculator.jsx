import React, { useState } from 'react'
import { Calculator as CalcIcon, X, Delete, Minimize2, Move } from 'lucide-react'
import { Card } from './UI'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [equation, setEquation] = useState('')
  const [hist, setHist] = useState([])
  const [open, setOpen] = useState(false)

  const handleNum = (n) => {
    if (display === '0') setDisplay(String(n))
    else setDisplay(display + n)
  }

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ')
    setDisplay('0')
  }

  const calculate = () => {
    try {
      const expr = equation + display
      // Basic math only for security
      const res = eval(expr.replace(/[^-()\d/*+.]/g, ''))
      setHist([expr + ' = ' + res, ...hist.slice(0, 4)])
      setDisplay(String(res))
      setEquation('')
    } catch (e) {
      setDisplay('Error')
    }
  }

  const clear = () => {
    setDisplay('0')
    setEquation('')
  }

  if (!open) return (
    <button 
      onClick={() => setOpen(true)}
      style={{
        position: 'fixed', bottom: 80, right: 20, zIndex: 100,
        width: 50, height: 50, borderRadius: '50%',
        background: 'var(--accent)', color: '#000',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 32px var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <CalcIcon size={24} />
    </button>
  )

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 1000, width: 300 }}>
       <Card glass style={{ padding: '1rem', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>MONETA CALC</span>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Minimize2 size={16} /></button>
          </div>

          <div style={{ background: 'rgba(0,0.0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: 12, textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', minHeight: 16 }}>{equation}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{display}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <button key="C" onClick={clear} style={{ gridColumn: 'span 2', padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-hover)', color: 'var(--red)', fontWeight: 700 }}>C</button>
            <button key="del" onClick={() => setDisplay(display.slice(0, -1) || '0')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-hover)', color: 'var(--text-muted)' }}><Delete size={14} /></button>
            <button key="/" onClick={() => handleOp('/')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent-bg)', color: 'var(--accent)' }}>/</button>
            
            {[7,8,9].map(n => <button key={n} onClick={() => handleNum(n)} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-card)', color: '#fff' }}>{n}</button>)}
            <button key="*" onClick={() => handleOp('*')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent-bg)', color: 'var(--accent)' }}>×</button>
            
            {[4,5,6].map(n => <button key={n} onClick={() => handleNum(n)} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-card)', color: '#fff' }}>{n}</button>)}
            <button key="-" onClick={() => handleOp('-')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent-bg)', color: 'var(--accent)' }}>-</button>
            
            {[1,2,3].map(n => <button key={n} onClick={() => handleNum(n)} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-card)', color: '#fff' }}>{n}</button>)}
            <button key="+" onClick={() => handleOp('+')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent-bg)', color: 'var(--accent)' }}>+</button>
            
            <button key="0" onClick={() => handleNum(0)} style={{ gridColumn: 'span 2', padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-card)', color: '#fff' }}>0</button>
            <button key="." onClick={() => handleNum('.')} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--bg-card)', color: '#fff' }}>.</button>
            <button key="=" onClick={calculate} style={{ padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 800 }}>=</button>
          </div>
       </Card>
    </div>
  )
}
