import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMock } from '../lib/mockService'
import { Client } from '../types/client'

export default function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
  }, [])

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return clients
    return clients.filter((client) => client.name.toLowerCase().includes(term) || client.email?.toLowerCase().includes(term) || client.id.toLowerCase().includes(term))
  }, [clients, searchTerm])

  return (
    <div>
      <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-slate-400 mt-1">Basic client search for disconnected account and CRM workflows.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search clients by name, email, or ID"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand-500 sm:w-auto"
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 text-sm">Open records in new tabs for manual workflows.</div>
        </div>
      </header>

      <div className="bg-[#0f1724] rounded-lg p-4 overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Open in Tab</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                <td className="px-3 py-2 text-slate-100">{c.name}</td>
                <td className="px-3 py-2 text-slate-400">{c.email}</td>
                <td className="px-3 py-2 text-slate-400">{c.onboardingStatus}</td>
                <td className="px-3 py-2">
                  <a
                    href={`/clients/${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-200 hover:border-brand-500 hover:bg-slate-900 transition"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
