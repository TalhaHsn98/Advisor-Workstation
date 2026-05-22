import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, SectionHeader } from '../components/ui'
import { fetchMock, createCrmNote } from '../lib/mockService'
import { Client } from '../types/client'
import { Portfolio, Holding } from '../types/portfolio'
import DonutChart from '../components/charts/DonutChart'
import { Household } from '../types/household'
import { CRMNote } from '../types/crmNote'
import { ServiceRequest } from '../types/serviceRequest'
import { AlertItem, Interaction } from '../types'

const statusColor = (status: string) => {
  if (status === 'complete' || status === 'closed') return 'bg-emerald-500/15 text-emerald-300'
  if (status === 'pending' || status === 'incomplete') return 'bg-amber-500/15 text-amber-300'
  return 'bg-slate-700 text-slate-200'
}

export default function Client360Page() {
  const { clientId } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [notes, setNotes] = useState<CRMNote[]>([])
  const [draftNote, setDraftNote] = useState('')

  useEffect(() => {
    if (!clientId) return

    fetchMock<Client[]>('clients').then((list) => {
      const found = list.find((item) => item.id === clientId) || null
      setClient(found)
    })

    fetchMock<Portfolio[]>('portfolios').then((list) => {
      const found = list.find((item) => item.clientId === clientId) || null
      setPortfolio(found)
    })

    fetchMock<Household[]>('households').then((list) => {
      const found = list.find((item) => item.id === client?.householdId || clientId) || null
      setHousehold(found)
    })

    fetchMock<AlertItem[]>('alerts').then(setAlerts)
    fetchMock<Interaction[]>('interactions').then(setInteractions)
    fetchMock<ServiceRequest[]>('serviceRequests').then(setRequests)
    fetchMock<CRMNote[]>('crmNotes').then(setNotes)
  }, [clientId, client?.householdId])

  const clientAlerts = useMemo(
    () => alerts.filter((alert) => alert.clientId === clientId),
    [alerts, clientId]
  )

  const clientInteractions = useMemo(
    () => interactions.filter((interaction) => interaction.clientId === clientId),
    [interactions, clientId]
  )

  const clientRequests = useMemo(
    () => requests.filter((request) => request.clientId === clientId),
    [requests, clientId]
  )

  const clientNotes = useMemo(
    () => notes.filter((note) => note.clientId === clientId),
    [notes, clientId]
  )

  const handleAddNote = async () => {
    if (!draftNote.trim()) return

    const note = await createCrmNote({
      clientId: clientId || 'unknown',
      advisorId: client?.primaryAdvisorId || 'adv-1',
      content: draftNote.trim()
    })

    setNotes((current) => [note, ...current])
    setDraftNote('')
  }

  const holdings: Holding[] = useMemo(
    () => portfolio?.accounts.flatMap((account) => account.holdings || []) || [],
    [portfolio]
  )

  const allocationSlices = useMemo(() => {
    const total = holdings.reduce((s, h) => s + (h.marketValue || 0), 0) || 1
    return holdings.slice(0, 6).map((h) => ({ label: h.ticker, value: h.marketValue || 0 }))
  }, [holdings])

  if (!client) {
    return <div className="text-slate-300">Loading client profile...</div>
  }

  return (
    <div>
      <header className="flex flex-col gap-4 lg:gap-6 mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{client.name}</h1>
            <p className="text-slate-400 mt-1">Primary advisor: {client.primaryAdvisorId || 'N/A'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/crm/${client.id}`}
              className="inline-flex rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
            >
              Open CRM for client
            </Link>
            <Link
              to="/crm"
              className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Full CRM workspace
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Onboarding</div>
            <div className="mt-2 text-lg font-semibold">{client.onboardingStatus || 'Unknown'}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">KYC</div>
            <div className="mt-2 text-lg font-semibold">{client.kycStatus?.status || 'Unknown'}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Risk profile</div>
            <div className="mt-2 text-lg font-semibold">{client.riskProfile || 'Unassigned'}</div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Portfolio Balances</h2>
              <span className="text-sm text-slate-500">Updated daily</span>
            </div>
            {portfolio ? (
              <div className="grid gap-4 md:grid-cols-2">
                {portfolio.accounts.map((account) => (
                  <div key={account.accountId} className="rounded-2xl bg-slate-950 p-4">
                    <div className="text-slate-400 text-sm">{account.accountType}</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-100">
                      ${account.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-slate-500 text-sm mt-2">{account.currency} • {account.accountId}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400">No portfolio data is available for this client.</div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Holdings</h2>
              <span className="text-sm text-slate-500">{holdings.length} positions</span>
            </div>
            {holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="px-3 py-3">Ticker</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Qty</th>
                      <th className="px-3 py-3">Value</th>
                      <th className="px-3 py-3">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.id} className="border-b border-slate-800 hover:bg-slate-950/60">
                        <td className="px-3 py-3 font-semibold text-slate-100">{holding.ticker}</td>
                        <td className="px-3 py-3 text-slate-400">{holding.name}</td>
                        <td className="px-3 py-3">{holding.quantity}</td>
                        <td className="px-3 py-3">${holding.marketValue?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-3">{holding.allocationPercent?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-400">No holdings are configured for this client account.</div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6">
              <h3 className="text-lg font-semibold">Interaction History</h3>
              <div className="mt-4 space-y-3">
                {clientInteractions.slice(0, 4).map((interaction) => (
                  <div key={interaction.id} className="rounded-2xl bg-slate-950 p-3">
                    <div className="font-medium text-slate-100">{interaction.type}</div>
                    <div className="text-slate-400 text-sm">{interaction.date}</div>
                    <p className="mt-2 text-slate-300 text-sm">{interaction.summary}</p>
                  </div>
                ))}
                {clientInteractions.length === 0 && <div className="text-slate-400">No recent interactions found.</div>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">CRM Notes</h3>
                <Badge variant="info">Client specific</Badge>
              </div>
              <div className="mt-4 space-y-4">
                <textarea
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-500"
                  placeholder="Add a client-specific note..."
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!draftNote.trim()} className="px-5">
                    Save Note
                  </Button>
                </div>
                <div className="space-y-3">
                  {clientNotes.slice(0, 3).map((note) => (
                    <div key={note.id} className="rounded-2xl bg-slate-950 p-3">
                      <div className="text-slate-400 text-xs">{note.createdAt}</div>
                      <p className="mt-2 text-slate-300 text-sm">{note.content}</p>
                    </div>
                  ))}
                  {clientNotes.length === 0 && <div className="text-slate-400">No CRM notes available.</div>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Client Snapshot</h2>
            <div className="mt-4 space-y-4 text-slate-300">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-[0.18em]">Date of birth</div>
                <div>{client.dob || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-[0.18em]">Email</div>
                <div>{client.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-[0.18em]">Phone</div>
                <div>{client.phone || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-[0.18em]">Household</div>
                <div>{household?.householdName || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Allocation</h2>
            <div className="mt-4">
              {allocationSlices.length ? (
                <div className="flex items-center gap-4">
                  <DonutChart slices={allocationSlices} size={140} stroke={18} />
                  <div className="text-slate-300 space-y-2">
                    {allocationSlices.map((s) => (
                      <div key={s.label} className="text-sm">
                        <strong className="text-slate-100">{s.label}</strong>: ${s.value.toLocaleString('en-US')}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400">Allocation data not available.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Alerts</h2>
              <span className="text-sm text-slate-500">{clientAlerts.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {clientAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`rounded-2xl p-3 ${statusColor(alert.severity)}`}>
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-slate-400 text-xs mt-1">{alert.createdAt}</div>
                </div>
              ))}
              {clientAlerts.length === 0 && <div className="text-slate-400">No active alerts.</div>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Service Requests</h2>
              <span className="text-sm text-slate-500">{clientRequests.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {clientRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="rounded-2xl bg-slate-950 p-3">
                  <div className="font-medium text-slate-100">{request.summary || 'Request detail unavailable'}</div>
                  <div className="text-slate-400 text-xs mt-1">{request.status}</div>
                </div>
              ))}
              {clientRequests.length === 0 && <div className="text-slate-400">No open service requests.</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
