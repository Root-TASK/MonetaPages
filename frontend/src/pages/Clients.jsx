import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Mail, Phone, Building, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import { Button, Card, Input, Modal, Spinner, EmptyState, Table } from '../components/UI'
import { fetchClients, createClient, updateClient, deleteClient } from '../utils/api'
import toast from 'react-hot-toast'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editClient, setEditClient] = useState(null)
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (err) { toast.error('Failed to load clients') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Client name is required')
    try {
      if (editClient) {
        await updateClient(editClient.id, form)
        toast.success('Client updated')
      } else {
        await createClient(form)
        toast.success('Client added')
      }
      load()
      setShowForm(false)
      setEditClient(null)
      setForm({ name: '', email: '', phone: '', company: '', notes: '' })
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return
    try {
      await deleteClient(id)
      toast.success('Client deleted')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fade-up" style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Client Directory</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage your business contacts and partnerships</p>
        </div>
        <Button onClick={() => { setEditClient(null); setForm({ name: '', email: '', phone: '', company: '', notes: '' }); setShowForm(true) }}>
          <Plus size={18} /> New Client
        </Button>
      </div>

      <Card style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search by name or company..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40, width: '100%', background: 'transparent', border: 'none' }}
          />
        </div>
      </Card>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div> : (
        <div className="grid-2">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}><EmptyState title="No clients found" description="Time to add your first partner" /></div>
          ) : filtered.map(c => (
            <Card key={c.id} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--amber-bg)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {c.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{c.name}</div>
                      {c.company && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.company}</div>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: 'var(--text-secondary)' }}><Mail size={12} /> {c.email}</div>}
                    {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: 'var(--text-secondary)' }}><Phone size={12} /> {c.phone}</div>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditClient(c); setForm(c); setShowForm(true) }} style={{ padding: 6, background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} style={{ padding: 6, background: 'transparent', color: 'var(--red)', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editClient ? 'Edit Client' : 'Add New Client'}>
        <div className="flex-col gap-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} icon={<User size={14} />} />
          <Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} icon={<Building size={14} />} />
          <div className="grid-2">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={<Mail size={14} />} />
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={<Phone size={14} />} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Private Notes</label>
            <textarea 
              rows={2} 
              placeholder="e.g. Project details..."
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})}
              style={{ 
                width: '100%',
                minHeight: '70px',
                padding: '10px 12px',
                fontSize: '13px',
                lineHeight: '1.4'
              }}
            />
          </div>
          <Button onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {editClient ? 'Update Client' : 'Save Client'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
