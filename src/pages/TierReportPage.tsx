import React, { useEffect, useMemo, useState } from 'react'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { Client } from '../types/client'

const TIERS_KEY = 'advisor-client-tiers'

export default function TierReportPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [tiersMap, setTiersMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
    try {
      const raw = localStorage.getItem(TIERS_KEY)
      setTiersMap(raw ? JSON.parse(raw) : {})
    } catch (e) {
      setTiersMap({})
    }
  }, [])

  const rows = useMemo(() => clients.map((c) => ({ id: c.id, name: c.name, tier: (tiersMap[c.id] || '').trim() })), [clients, tiersMap])

  const inconsistencies = useMemo(() => {
    const groups: Record<string, string[]> = {}
    rows.forEach((r) => {
      const norm = r.tier.toLowerCase().replace(/[^a-z0-9]/g, '') || '(blank)'
      ;(groups[norm] = groups[norm] || []).push(r.tier || '(blank)')
    })
    return Object.entries(groups).map(([k, v]) => ({ normalized: k, samples: Array.from(new Set(v)).slice(0, 5), count: v.length }))
  }, [rows])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Manual Tiering Report</h1>
          <p className="text-slate-400 mt-1">Shows free-text tiers entered by advisors and highlights naming variations (AS-IS).</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => {
              // seed a few sample tiers for demonstration
              const samples = ['A', 'A+', 'A1', 'a', 'B', 'b', 'C', 'C1']
              const map: Record<string, string> = { ...(tiersMap || {}) }
              clients.slice(0, 6).forEach((c, i) => {
                map[c.id] = samples[i % samples.length]
              })
              try {
                localStorage.setItem(TIERS_KEY, JSON.stringify(map))
                setTiersMap(map)
                alert('Seeded sample tiers into localStorage (advisor-client-tiers)')
              } catch (e) {
                alert('Failed to seed sample tiers')
              }
            }}
            className="rounded-2xl bg-yellow-500 px-3 py-2 text-slate-900"
          >
            Seed sample tiers
          </button>
        </div>
      </header>

      <Card>
        <SectionHeader title="Tier Overview" subtitle="Counts and sample variations (normalized)" />
        <div className="mt-4 space-y-3">
          {inconsistencies.map((g) => (
            <div key={g.normalized} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-100">{g.normalized}</div>
                  <div className="text-xs text-slate-400">Samples: {g.samples.join(', ')}</div>
                </div>
                <div className="text-slate-300">Count: {g.count}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="All Client Tiers" subtitle="Raw free-text entries per client." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-auto text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-3">Client</th>
                <th className="px-3 py-3">Tier (raw)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                  <td className="px-3 py-3 text-slate-100">{r.name}</td>
                  <td className="px-3 py-3">{r.tier || '(blank)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
