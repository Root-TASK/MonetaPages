import React, { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { Card, StatCard, ProgressBar, Spinner, EmptyState, Button } from '../components/UI'
import { fetchMonthlyReport, fetchDailyReport, sendReportEmail } from '../utils/api'
import { fmtCurrency, fmtShort, fmtMonth, fmtMonthShort, fmtDate, thisMonth, thisYear } from '../utils/format'
import { Mail, Download, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>{p.name}: ₹{fmtShort(p.value)}</div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [view, setView] = useState('monthly')
  const [monthly, setMonthly] = useState([])
  const [daily, setDaily] = useState([])
  const [selMonth, setSelMonth] = useState(thisMonth())
  const [loading, setLoading] = useState(true)
  const [emailing, setEmailing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [m, d] = await Promise.all([
        fetchMonthlyReport(thisYear()),
        fetchDailyReport(selMonth),
      ])
      setMonthly(m)
      setDaily(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [selMonth])

  useEffect(() => { load() }, [load])

  const totalStats = monthly.reduce((acc, m) => ({
    inc: acc.inc + m.total_income,
    exp: acc.exp + m.total_expense,
    cli: acc.cli + m.client_expense,
    com: acc.com + m.company_expense,
  }), { inc: 0, exp: 0, cli: 0, com: 0 })

  const chartDataMonthly = monthly.map(m => ({
    name: fmtMonthShort(m.month),
    Income: m.total_income,
    Expense: m.total_expense,
    Balance: m.closing_balance,
    'Client Exp': m.client_expense,
    'Company Exp': m.company_expense,
  }))

  const chartDataDaily = daily.map(d => ({
    name: d.date.slice(5),
    Income: d.total_income,
    Expense: d.total_expense,
    Balance: d.closing_balance,
  }))

  const TABS = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'daily',   label: 'Daily' },
  ]

  const handleEmailReport = async () => {
    setEmailing(true)
    try {
      await sendReportEmail()
      toast.success('Report sent successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setEmailing(false)
    }
  }

  const handleDownload = () => {
    const data = view === 'monthly' ? monthly : daily
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => headers.map(h => `"${row[h]}"`).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `moneta_report_${view}_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Spinner size={28} />
    </div>
  )

  return (
    <div className="fade-up" style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Reports</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>Financial summaries and trends</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={handleDownload}><Download size={14} /> Download CSV</Button>
            <Button variant="secondary" size="sm" onClick={handleEmailReport} disabled={emailing}>
              <Mail size={14} /> {emailing ? 'Emailing...' : 'Email Summary'}
            </Button>
          </div>
        </div>
      </div>

      {/* Year Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Year Income" value={`₹${fmtCurrency(totalStats.inc)}`} color="var(--green)" />
        <StatCard label="Year Expense" value={`₹${fmtCurrency(totalStats.exp)}`} color="var(--red)" />
        <StatCard label="Client Expenses" value={`₹${fmtCurrency(totalStats.cli)}`} color="var(--blue)" />
        <StatCard label="Company Expenses" value={`₹${fmtCurrency(totalStats.com)}`} color="var(--amber)" />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: view === id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              color: view === id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '14px', fontWeight: view === id ? 600 : 400, cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
        {view === 'daily' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
            <input
              type="month"
              value={selMonth}
              onChange={e => setSelMonth(e.target.value)}
              style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
            />
          </div>
        )}
      </div>

      {view === 'monthly' && (
        <>
          {monthly.length === 0 ? (
            <EmptyState icon="📊" title="No data yet" description="Add transactions to see monthly reports" />
          ) : (
            <>
              {/* Combined Chart */}
              <Card style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Income vs Expense by Month
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartDataMonthly} barGap={3} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => '₹' + fmtShort(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                    <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    <Bar dataKey="Expense" fill="var(--red)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Expense Split Chart */}
              <Card style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Client vs Company Expenses
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartDataMonthly} barGap={3} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => '₹' + fmtShort(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                    <Bar dataKey="Client Exp" fill="var(--blue)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    <Bar dataKey="Company Exp" fill="var(--amber)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...monthly].reverse().map(m => {
                  const net = m.total_income - m.total_expense
                  const maxExp = Math.max(m.client_expense, m.company_expense, 1)
                  return (
                    <Card key={m.month}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>{fmtMonth(m.month)}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{m.transaction_count} transactions</div>
                        </div>
                        <span style={{
                          background: net >= 0 ? 'var(--green-bg)' : 'var(--red-bg)',
                          color: net >= 0 ? 'var(--green)' : 'var(--red)',
                          border: `1px solid ${net >= 0 ? 'var(--green-border)' : 'var(--red-border)'}`,
                          padding: '4px 14px', borderRadius: 20, fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                        }}>
                          {net >= 0 ? '+' : '-'}₹{fmtCurrency(Math.abs(net))}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                        {[
                          { l: 'Opening', v: m.opening_balance, c: null },
                          { l: 'Income', v: m.total_income, c: 'var(--green)' },
                          { l: 'Expense', v: m.total_expense, c: 'var(--red)' },
                          { l: 'Closing', v: m.closing_balance, c: m.closing_balance >= 0 ? 'var(--green)' : 'var(--red)' },
                        ].map(({ l, v, c }) => (
                          <div key={l} style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: c || 'var(--text-primary)' }}>₹{fmtShort(v)}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '12px', color: 'var(--blue)' }}>Client exp</span>
                            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{fmtShort(m.client_expense)}</span>
                          </div>
                          <ProgressBar value={m.client_expense} max={maxExp} color="var(--blue)" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '12px', color: 'var(--amber)' }}>Company exp</span>
                            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{fmtShort(m.company_expense)}</span>
                          </div>
                          <ProgressBar value={m.company_expense} max={maxExp} color="var(--amber)" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {view === 'daily' && (
        <>
          {daily.length === 0 ? (
            <EmptyState icon="📅" title="No data for this month" description="Select a different month or add transactions" />
          ) : (
            <>
              <Card style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Daily Income vs Expense — {fmtMonth(selMonth)}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartDataDaily} barGap={2} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => '₹' + fmtShort(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Income" fill="var(--green)" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
                    <Bar dataKey="Expense" fill="var(--red)" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Daily Table */}
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500, fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Date', 'Opening', 'Income', 'Expense', 'Client Exp', 'Company Exp', 'Closing', 'Txns'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: i > 0 ? 'right' : 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daily.map(d => {
                        const net = d.total_income - d.total_expense
                        return (
                          <tr key={d.date} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>{fmtDate(d.date)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>₹{fmtShort(d.opening_balance)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>+₹{fmtShort(d.total_income)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 600 }}>-₹{fmtShort(d.total_expense)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue)' }}>₹{fmtShort(d.client_expense)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)' }}>₹{fmtShort(d.company_expense)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.closing_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>₹{fmtShort(d.closing_balance)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>{d.transaction_count}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
