import React, { useEffect, useMemo, useState } from 'react'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { Client } from '../types/client'

const REMINDER_KEY = 'advisor-reminders'
const MS_PER_DAY = 1000 * 60 * 60 * 24

function daysUntilDate(dob: string, milestoneAge: number) {
  const birth = new Date(dob)
  const milestone = new Date(birth)
  milestone.setFullYear(birth.getFullYear() + milestoneAge)
  const now = new Date()
  const days = Math.ceil((milestone.getTime() - now.getTime()) / MS_PER_DAY)
  return { milestoneDate: milestone, days }
}

export default function RmdScannerPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [onlyNear, setOnlyNear] = useState(true)

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
  }, [])

  useEffect(() => {
    const now = new Date()
    const ages = [65, 70, 72]
    const list = clients
      .filter((c) => !!c.dob)
      .map((c) => {
        const milestones = ages.map((age) => ({ age, ...daysUntilDate(c.dob as string, age) }))
        // prefer upcoming milestone (days >= 0), otherwise pick nearest
        const upcoming = milestones.filter((m) => m.days >= 0)
        const chosen = upcoming.length ? upcoming.reduce((a, b) => (a.days < b.days ? a : b)) : milestones.reduce((a, b) => (Math.abs(a.days) < Math.abs(b.days) ? a : b))
        return {
          client: c,
          milestoneAge: chosen.age,
          milestoneDate: chosen.milestoneDate.toISOString().slice(0, 10),
          daysUntil: chosen.days
        }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)

    setCandidates(list)
  }, [clients])

  const visible = useMemo(() => (onlyNear ? candidates.filter((c) => c.daysUntil >= 0 && c.daysUntil <= 180) : candidates), [candidates, onlyNear])

  const createReminder = (clientId: string, name: string, age: number, date: string) => {
    try {
      const raw = localStorage.getItem(REMINDER_KEY)
      const existing = raw ? JSON.parse(raw) : []
      const reminder = { id: `r-${Date.now()}`, title: `RMD check: ${name} turns ${age}`, date, note: 'Manual RMD reminder' }
      existing.unshift(reminder)
      localStorage.setItem(REMINDER_KEY, JSON.stringify(existing))
      alert('Reminder created in Manual Reminders')
    } catch (e) {
      alert('Failed to create reminder')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">RMD Scanner</h1>
        <p className="text-slate-400 mt-1">Scan clients for upcoming age milestones (65, 70, 72) to create manual RMD reminders.</p>
      </header>

      <Card>
        <SectionHeader title="Candidates" subtitle="Clients with nearest milestone (choose to only show those within 180 days)." />
        <div className="mt-4 flex items-center justify-between">
          <div className="text-slate-400 text-sm">Toggle to restrict to near-term milestones.</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyNear} onChange={(e) => setOnlyNear(e.target.checked)} />
            <span className="text-slate-300">Only within 180 days</span>
          </label>
        </div>
        <div className="mt-4 space-y-3">
          {visible.length ? visible.map((entry) => (
            <div key={entry.client.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-100">{entry.client.name} — DOB: {entry.client.dob}</div>
                <div className="text-xs text-slate-400">Milestone: {entry.milestoneAge} on {entry.milestoneDate} • {entry.daysUntil >= 0 ? `${entry.daysUntil} days` : `${Math.abs(entry.daysUntil)} days ago`}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => createReminder(entry.client.id, entry.client.name, entry.milestoneAge, entry.milestoneDate)} className="rounded-2xl bg-brand-500 px-3 py-1 text-slate-900">Create Reminder</button>
              </div>
            </div>
          )) : <div className="text-slate-400">No candidates found for the current filter. Try unchecking "Only within 180 days" to view all nearest milestones.</div> }
        </div>
      </Card>
    </div>
  )
}
