import React, { useMemo, useState } from 'react'
import { CRMNote } from '../types/crmNote'
import { updateCrmNote, deleteCrmNote } from '../lib/mockService'
import { Button } from './ui'

type Props = {
  notes: CRMNote[]
  onChange: (notes: CRMNote[]) => void
}

export default function CRMNotesList({ notes, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.content.toLowerCase().includes(q) || (n.tags || []).join(' ').toLowerCase().includes(q))
  }, [notes, query])

  const handleSave = async (id: string, content: string) => {
    const updated = await updateCrmNote(id, content)
    if (updated) {
      onChange(notes.map((n) => (n.id === id ? updated : n)))
      setEditingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await deleteCrmNote(id)
    if (ok) onChange(notes.filter((n) => n.id !== id))
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes or tags..."
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 outline-none"
        />
        <div className="text-sm text-slate-400">{filtered.length} matches</div>
      </div>

      <div className="space-y-3">
        {filtered.map((note) => (
          <div key={note.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-slate-400 text-xs">{note.createdAt}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingId(note.id)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(note.id)}>Delete</Button>
              </div>
            </div>
            {editingId === note.id ? (
              <EditableNote note={note} onSave={handleSave} onCancel={() => setEditingId(null)} />
            ) : (
              <p className="mt-2 text-slate-300 text-sm">{note.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EditableNote({ note, onSave, onCancel }: { note: CRMNote; onSave: (id: string, content: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(note.content)
  return (
    <div className="mt-3">
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200" />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(note.id, value)}>Save</Button>
      </div>
    </div>
  )
}
