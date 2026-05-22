import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMock } from '../lib/mockService'
import { Client } from '../types/client'

export default function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
  }, [])

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
      </header>

      <div className="bg-[#0f1724] rounded-lg p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <Link to={`/clients/${c.id}`} className="text-slate-100 hover:underline">{c.name}</Link>
                </td>
                <td className="px-3 py-2 text-slate-400">{c.email}</td>
                <td className="px-3 py-2 text-slate-400">{c.onboardingStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
