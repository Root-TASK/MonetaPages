import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Badge, Spinner, EmptyState } from '../../components/UI'
import { fetchTasks, createTask, updateTask, deleteTask } from '../../utils/api'
import { CheckCircle2, Circle, Clock, Plus, Trash2, Calendar as CalIcon, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { fmtDate } from '../../utils/format'

export default function TaskHub() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [adding, setAdding] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (e) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await createTask({ title: newTitle, due_date: dueDate || null })
      setNewTitle('')
      setDueDate('')
      load()
      toast.success('Task added')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  const toggleTask = async (task) => {
    try {
      await updateTask(task.id, { ...task, is_done: task.is_done ? 0 : 1 })
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_done: t.is_done ? 0 : 1 } : t))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => a.is_done - b.is_done || new Date(a.created_at) - new Date(b.created_at))

  return (
    <div className="fade-up" style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Task Hub</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>Manage your to-dos and reminders</p>
        </div>
        <Badge text={`${tasks.filter(t => !t.is_done).length} active`} variant="accent" />
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleAddTask} className="flex-col gap-4">
          <Input 
            placeholder="What needs to be done?" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ fontSize: '15px' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4, display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Due Date (Optional)</label>
              <Input 
                type="date" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                icon={<Clock size={14} />}
              />
            </div>
            <Button type="submit" disabled={adding || !newTitle.trim()} style={{ height: 44, padding: '0 24px' }}>
              <Plus size={18} /> {adding ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex-col gap-3">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner /></div>
        ) : sortedTasks.length === 0 ? (
          <EmptyState icon="✅" title="All set!" description="You have no tasks or reminders right now." />
        ) : (
          sortedTasks.map(task => (
            <div 
              key={task.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s',
                opacity: task.is_done ? 0.6 : 1,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                onClick={() => toggleTask(task)}
                style={{ cursor: 'pointer', color: task.is_done ? 'var(--green)' : 'var(--text-muted)' }}
              >
                {task.is_done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  textDecoration: task.is_done ? 'line-through' : 'none',
                  color: task.is_done ? 'var(--text-muted)' : 'var(--text-primary)'
                }}>
                  {task.title}
                </div>
                {task.due_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '11px', color: 'var(--amber)' }}>
                    <AlertCircle size={10} />
                    Due {fmtDate(task.due_date)}
                  </div>
                )}
              </div>

              <Button variant="ghost" onClick={() => handleDelete(task.id)} style={{ padding: 8 }}>
                <Trash2 size={16} color="var(--red)" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
