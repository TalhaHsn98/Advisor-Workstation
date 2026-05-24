import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock, simulatePortfolioEvent } from '../lib/mockService'
import { Portfolio } from '../types/portfolio'
import { PortfolioSnapshot } from '../types/portfolioSnapshot'
import { Client } from '../types/client'

export default function PortfoliosPage() {
  const { clientId } = useParams()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [aumSnapshots, setAumSnapshots] = useState<PortfolioSnapshot[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchMock<Portfolio[]>('portfolios').then(setPortfolios)
    fetchMock<Client[]>('clients').then(setClients)
    fetchMock<PortfolioSnapshot[]>('portfolioSnapshots').then(setAumSnapshots)
  }, [])

  const totalAum = useMemo(() => portfolios.reduce((sum, p) => sum + p.accounts.reduce((s, a) => s + (a.balance || 0), 0), 0), [portfolios])
  const incompleteClients = useMemo(() => clients.filter((client) => client.onboardingStatus === 'incomplete').length, [clients])

  const clientPortfolio = useMemo(() => portfolios.find((p) => p.clientId === clientId) || null, [portfolios, clientId])

  const clientNameMap = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients]
  )

  const topHoldings = useMemo(() => {
    const map = new Map<string, { ticker: string; value: number }>()
    portfolios.forEach((p) => p.accounts.forEach((a) => (a.holdings || []).forEach((h) => {
      const existing = map.get(h.ticker) || { ticker: h.ticker, value: 0 }
      existing.value += (h.marketValue || 0)
      map.set(h.ticker, existing)
    })))
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [portfolios])

  const aumSeries = useMemo(() => {
    if (aumSnapshots.length) {
      return aumSnapshots.slice().reverse().map((snapshot) => snapshot.aum)
    }
    const total = portfolios.reduce((sum, p) => sum + p.accounts.reduce((s, a) => s + (a.balance || 0), 0), 0)
    const arr = Array.from({ length: 12 }).map((_, i) => Math.round(total * (0.9 + 0.1 * Math.sin((i / 12) * Math.PI * 2) + (i - 6) * 0.002)))
    return arr
  }, [portfolios, aumSnapshots])

  const handleSim = async () => {
    const res = await simulatePortfolioEvent()
    setMessage(res.details)
    // reload data and snapshot history
    fetchMock<Portfolio[]>('portfolios').then(setPortfolios)
    fetchMock<PortfolioSnapshot[]>('portfolioSnapshots').then(setAumSnapshots)
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Portfolios</h1>
        <p className="text-slate-400 mt-1">Advisor-level portfolio summary and client drilldowns.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Total AUM</div>
                <div className="mt-2 text-2xl font-semibold">${totalAum.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                  <span>{clients.length} clients</span>
                  <span>{incompleteClients} onboarding gaps</span>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    Historical AUM snapshots are available in the table below for manual review.
                  </div>
                  <button className="rounded-2xl bg-brand-500 px-4 py-2 text-slate-900 font-semibold" onClick={handleSim}>Simulate</button>
                </div>
              </div>
            </div>
            {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
          </Card>

          <Card>
            <SectionHeader title="AUM history" subtitle="Recent portfolio snapshots" />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">AUM</th>
                    <th className="px-3 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {aumSnapshots.slice(0, 8).map((snapshot) => (
                    <tr key={snapshot.date} className="border-b border-slate-800 hover:bg-slate-900/70">
                      <td className="px-3 py-3">{snapshot.date}</td>
                      <td className="px-3 py-3">${snapshot.aum.toLocaleString('en-US')}</td>
                      <td className="px-3 py-3 text-slate-400">{snapshot.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Client portfolios" subtitle="Balances by client" />
            <div className="mt-4 space-y-3">
              {portfolios.map((p) => (
                <div key={p.clientId} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-xs">Client</div>
                    <div className="mt-1 font-medium text-slate-100">{clientNameMap[p.clientId] || p.clientId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs">Balance</div>
                    <div className="mt-1 text-lg font-semibold">${p.accounts.reduce((s, a) => s + (a.balance || 0), 0).toLocaleString('en-US')}</div>
                    <div className="mt-2 text-sm text-slate-400">Balance breakdown requires manual account review.</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {clientId && clientPortfolio && (
            <Card>
              <SectionHeader title="Portfolio Detail" subtitle={`Client ${clientNameMap[clientId] || clientId}`} />
              <div className="mt-4">
                {clientPortfolio.accounts.map((a) => (
                  <div key={a.accountId} className="mb-4">
                    <div className="text-slate-400 text-sm">{a.accountType} • {a.accountId}</div>
                    <div className="mt-2 text-xl font-semibold">${a.balance.toLocaleString('en-US')}</div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="px-3 py-3">Ticker</th>
                            <th className="px-3 py-3">Name</th>
                            <th className="px-3 py-3">Qty</th>
                            <th className="px-3 py-3">Value</th>
                            <th className="px-3 py-3">Spark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(a.holdings || []).map((h: any) => (
                            <tr key={h.id} className="border-b border-slate-800 hover:bg-slate-950/60">
                              <td className="px-3 py-3 font-semibold text-slate-100">{h.ticker}</td>
                              <td className="px-3 py-3 text-slate-400">{h.name}</td>
                              <td className="px-3 py-3">{h.quantity}</td>
                              <td className="px-3 py-3">${(h.marketValue || 0).toLocaleString('en-US')}</td>
                              <td className="px-3 py-3 text-slate-400">Recent price movement visible in statements.</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionHeader title="Top holdings" subtitle="Across all clients" />
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                Holdings summary is provided for manual reconciliation and does not include a consolidated graph.
              </div>
              {topHoldings.map((h) => (
                <div key={h.ticker} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-slate-400 text-xs">{h.ticker}</div>
                  <div className="mt-1 font-medium text-slate-100">${h.value.toLocaleString('en-US')}</div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
