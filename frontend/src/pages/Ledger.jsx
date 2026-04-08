import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Download } from 'lucide-react'
import { Button, StatCard, Card, Badge, Table, Spinner, EmptyState, Select, CapsuleSelect } from '../components/UI'
import TransactionForm from '../components/TransactionForm'
import TransactionDetail from '../components/TransactionDetail'
import { fetchTransactions, fetchOpeningBalance } from '../utils/api'
import { fmtCurrency, fmtShort, fmtDate, thisMonth, today } from '../utils/format'

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i)
  return d.toISOString().slice(0, 7)
})

export default function Ledger() {
  const [txs, setTxs] = useState([])
  const [ob, setOb] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('month')   // month | day | all
  const [selMonth, setSelMonth] = useState(thisMonth())
  const [selDay, setSelDay] = useState(today())
  const [fType, setFType] = useState('all')
  const [fCat, setFCat] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [showForm, setShowForm] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (viewMode === 'month') params.month = selMonth
      if (viewMode === 'day')   params.day = selDay
      if (fType !== 'all')      params.type = fType
      if (fCat !== 'all')       params.category = fCat
      if (search.trim())        params.search = search.trim()

      const [data, settings] = await Promise.all([
        fetchTransactions(params),
        fetchOpeningBalance(),
      ])
      setOb(settings.opening_balance)

      // Client-side sort
      const sorted = [...data].sort((a, b) => {
        if (sort === 'date_desc') return b.date.localeCompare(a.date) || b.id - a.id
        if (sort === 'date_asc')  return a.date.localeCompare(b.date) || a.id - b.id
        if (sort === 'amt_desc')  return b.amount - a.amount
        if (sort === 'amt_asc')   return a.amount - b.amount
        return 0
      })
      setTxs(sorted)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [viewMode, selMonth, selDay, fType, fCat, search, sort])

  useEffect(() => { load() }, [load])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const totalInc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const firstBal = txs.length ? txs.find(t => true)?.running_balance : null
  const lastBal  = txs.length ? txs[txs.length - 1]?.running_balance : ob

  // Opening balance for current view (balance before first tx in view)
  const viewOpenBal = txs.length > 0
    ? (txs[txs.length - 1].running_balance - (totalInc - totalExp))
    : ob

  const exportCSV = () => {
    const rows = [
      ['Date', 'Description', 'Type', 'Category', 'Amount', 'Balance', 'Notes'],
      ...txs.map(t => [t.date, t.description, t.type, t.category, t.amount, t.running_balance, t.notes || '']),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `ledger-${selMonth || 'all'}.csv`
    a.click()
  }

  return (
    <div className="fade-up" style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Ledger</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>{txs.length} transaction{txs.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {txs.length > 0 && <Button variant="ghost" onClick={exportCSV} size="sm"><Download size={14} /> CSV</Button>}
          <Button onClick={() => { setEditTx(null); setShowForm(true) }}><Plus size={16} /> Add</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              placeholder="Search..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: 32, width: '100%' }}
            />
          </div>

          {/* View Mode */}
          <CapsuleSelect
            value={viewMode}
            onChange={v => setViewMode(v)}
            options={[
              { value: 'month', label: 'Monthly' },
              { value: 'day', label: 'Daily' },
              { value: 'all', label: 'All Time' }
            ]}
          />

          {viewMode === 'month' && (
            <select value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ flex: '0 0 auto' }}>
              {MONTHS.map(m => (
                <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>
              ))}
            </select>
          )}

          {viewMode === 'day' && (
            <input type="date" value={selDay} onChange={e => setSelDay(e.target.value)} style={{ flex: '0 0 auto', width: 'auto' }} />
          )}

          <CapsuleSelect
            value={fType}
            onChange={v => setFType(v)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]}
          />

          <CapsuleSelect
            value={fCat}
            onChange={v => setFCat(v)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'client', label: 'Client' },
              { value: 'company', label: 'Company' },
              { value: 'personal', label: 'Personal' }
            ]}
          />

          <select value={sort} onChange={e => setSort(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="date_desc">Date ↓ (Newest)</option>
            <option value="date_asc">Date ↑ (Oldest)</option>
            <option value="amt_desc">Amount ↓</option>
            <option value="amt_asc">Amount ↑</option>
          </select>
        </div>
      </Card>

      {/* Period Stats */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <StatCard label="Opening" value={`₹${fmtCurrency(viewOpenBal)}`} />
        <StatCard label="Income" value={`₹${fmtCurrency(totalInc)}`} color="var(--green)" />
        <StatCard label="Expense" value={`₹${fmtCurrency(totalExp)}`} color="var(--red)" />
        <StatCard
          label="Closing"
          value={`₹${fmtCurrency(lastBal)}`}
          color={lastBal >= 0 ? 'var(--green)' : 'var(--red)'}
          sub={`Net: ${totalInc - totalExp >= 0 ? '+' : '-'}₹${fmtShort(Math.abs(totalInc - totalExp))}`}
        />
      </div>

      {/* Transaction Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner size={28} />
          </div>
        ) : txs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No transactions found"
            description="Try adjusting your filters or date range"
            action={<Button onClick={() => { setShowForm(true) }}><Plus size={14} /> Add Transaction</Button>}
          />
        ) : (
          <>
            <Table headers={['Date', 'Description', 'Type', 'Amount', 'Balance', '']}>
              {txs.map(tx => (
                <tr
                  key={tx.id}
                  onClick={() => setDetail(tx)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {fmtDate(tx.date)}
                  </td>
                  <td style={{ padding: '11px 12px', verticalAlign: 'top', minWidth: 160 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{tx.description}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge text={tx.category} variant={tx.category} />
                      {tx.screenshot_path && <span style={{ fontSize: '11px' }} title="Has screenshot">📎</span>}
                    </div>
                    {tx.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{tx.notes}</div>}
                  </td>
                  <td style={{ padding: '11px 12px', verticalAlign: 'top' }}>
                    <Badge text={tx.type} variant={tx.type} />
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {tx.type === 'income' ? '+' : '-'}₹{fmtCurrency(tx.amount)}
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    ₹{fmtCurrency(tx.running_balance)}
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '14px', verticalAlign: 'top' }}>›</td>
                </tr>
              ))}
            </Table>

            {/* Table Footer */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{txs.length} records</span>
              <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--green)' }}>+₹{fmtCurrency(totalInc)}</span>
                <span style={{ color: 'var(--red)' }}>-₹{fmtCurrency(totalExp)}</span>
                <span>Bal: ₹{fmtCurrency(lastBal)}</span>
              </div>
            </div>
          </>
        )}
      </Card>

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTx(null) }}
        onSuccess={load}
        editData={editTx}
      />
      <TransactionDetail
        tx={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        onEdit={tx => { setEditTx(tx); setShowForm(true); setDetail(null) }}
        onDeleted={load}
      />
    </div>
  )
}
