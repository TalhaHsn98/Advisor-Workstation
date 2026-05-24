import React, { useEffect, useState } from 'react'
import { Card, SectionHeader } from '../components/ui'

type Note = { id: string; text: string; createdAt: string }

const STORAGE_KEY = 'advisor-sticky-notes'

export default function StickyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setNotes(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch (e) {}
  }, [notes])

  const add = () => {
    const t = text.trim()
    if (!t) return
    const n: Note = { id: `note-${Date.now()}`, text: t, createdAt: new Date().toISOString().slice(0, 10) }
    setNotes((s) => [n, ...s])
    setText('')
  }

  const remove = (id: string) => setNotes((s) => s.filter((n) => n.id !== id))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Sticky Notes</h1>
        <p className="text-slate-400 mt-1">Quick ephemeral notes saved to your browser (manual memory).</p>
      </header>

      <Card>
        <SectionHeader title="Add Note" subtitle="Capture a quick reminder or observation." />
        <div className="mt-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none" />
          <div className="mt-3 flex justify-end">
            <button onClick={add} className="rounded-2xl bg-brand-500 px-4 py-2 font-semibold text-slate-900">Add</button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Your Notes" subtitle="Recent sticky notes (local only)." />
        <div className="mt-4 space-y-3">
          {notes.length ? (
            notes.map((n) => (
              <div key={n.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-100">{n.text}</div>
                    <div className="text-xs text-slate-500 mt-1">{n.createdAt}</div>
                  </div>
                  <button onClick={() => remove(n.id)} className="text-sm text-slate-400">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No notes yet — add one above.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
