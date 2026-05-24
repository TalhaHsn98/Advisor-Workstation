import React, { useEffect, useMemo, useState } from 'react'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { TaskItem } from '../types'

type Reminder = { id: string; title: string; date: string; note?: string }
const STORAGE_KEY = 'advisor-reminders'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReminders(JSON.parse(raw))
    } catch (e) {}
    fetchMock<TaskItem[]>('tasks').then(setTasks)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
    } catch (e) {}
  }, [reminders])

  const add = () => {
    const t = title.trim()
    if (!t || !date) return
    const r: Reminder = { id: `r-${Date.now()}`, title: t, date, note: note.trim() }
    setReminders((s) => [r, ...s])
    setTitle('')
    setDate('')
    setNote('')
  }

  const remove = (id: string) => setReminders((s) => s.filter((r) => r.id !== id))

  const upcoming = useMemo(() => reminders.slice().sort((a, b) => a.date.localeCompare(b.date)), [reminders])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Reminders</h1>
        <p className="text-slate-400 mt-1">Simple date-based reminders saved locally — your personal calendar helpers.</p>
      </header>

      <Card>
        <SectionHeader title="Create Reminder" subtitle="Manual reminders for calls, RMDs, or ad-hoc follow-ups." />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={add} className="rounded-2xl bg-brand-500 px-4 py-2 font-semibold text-slate-900">Add Reminder</button>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Upcoming Reminders" subtitle="Local reminders and imported tasks (read-only)." />
        <div className="mt-4 space-y-3">
          {upcoming.length ? upcoming.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-100">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.date} {r.note ? `• ${r.note}` : ''}</div>
                </div>
                <button onClick={() => remove(r.id)} className="text-sm text-slate-400">Delete</button>
              </div>
            </div>
          )) : <div className="text-slate-400">No reminders — add one above.</div>}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Imported Tasks" subtitle="Tasks from the advisor task list (read-only)." />
        <div className="mt-4 space-y-3">
          {tasks.length ? tasks.slice(0,5).map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
              <div className="font-medium text-slate-100">{t.title}</div>
              <div className="text-xs text-slate-500">Due: {t.dueDate || 'TBD'} • Priority: {t.priority}</div>
            </div>
          )) : <div className="text-slate-400">No tasks available.</div>}
        </div>
      </Card>
    </div>
  )
}
