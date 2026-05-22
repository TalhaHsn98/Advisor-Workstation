import React, { useEffect, useState } from 'react'
import { fetchMock, simulatePortfolioEvent } from '../lib/mockService'
import { Advisor, AlertItem, TaskItem, Interaction } from '../types'
import { Client } from '../types/client'
import { ServiceRequest } from '../types/serviceRequest'
import { Portfolio } from '../types/portfolio'
import { PortfolioSnapshot } from '../types/portfolioSnapshot'
import { Badge, Card } from '../components/ui'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'

export default function DashboardPage() {
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [aum, setAum] = useState<number | null>(null)
  const [aumSnapshots, setAumSnapshots] = useState<PortfolioSnapshot[]>([])
  const [simMessage, setSimMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchMock<Advisor>('advisor').then(setAdvisor)
    fetchMock<AlertItem[]>('alerts').then(setAlerts)
    fetchMock<TaskItem[]>('tasks').then(setTasks)
    fetchMock<Interaction[]>('interactions').then(setInteractions)
    fetchMock<Client[]>('clients').then(setClients)
    fetchMock<ServiceRequest[]>('serviceRequests').then(setServiceRequests)
    fetchMock<Portfolio[]>('portfolios').then((list) => {
      setPortfolios(list)
      setAum(list.reduce((s, p) => s + p.accounts.reduce((a: number, ac: any) => a + (ac.balance || 0), 0), 0))
    })
    fetchMock<PortfolioSnapshot[]>('portfolioSnapshots').then((snapshots) => {
      setAumSnapshots(snapshots)
      if (snapshots.length) setAum(snapshots[0].aum)
    })
  }, [])

  const incompleteClients = React.useMemo(
    () => clients.filter((client) => client.onboardingStatus === 'incomplete').length,
    [clients]
  )

  const openServiceRequests = React.useMemo(
    () => serviceRequests.filter((request) => request.status !== 'closed').length,
    [serviceRequests]
  )

  const topClientsByAum = React.useMemo(() => {
    const clientNameMap = new Map(clients.map((client) => [client.id, client.name]))
    return portfolios
      .map((portfolio) => ({
        clientId: portfolio.clientId,
        name: clientNameMap.get(portfolio.clientId) || portfolio.clientId,
        aum: portfolio.accounts.reduce((sum, account) => sum + (account.balance || 0), 0)
      }))
      .sort((a, b) => b.aum - a.aum)
      .slice(0, 5)
  }, [clients, portfolios])

  const aumMiniSeries = React.useMemo(() => {
    if (aumSnapshots.length) {
      return aumSnapshots
        .slice()
        .reverse()
        .map((snapshot) => snapshot.aum)
        .slice(-8)
    }
    if (aum === null) return []
    return Array.from({ length: 8 }).map((_, i) => Math.round(aum * (0.95 + 0.05 * Math.sin(i))))
  }, [aum, aumSnapshots])

  return (
    <div className="space-y-6">
      <header className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Advisor dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Workstation overview</h1>
          <p className="mt-2 text-slate-400">A consolidated view of client activity, service requests, and advisor priorities.</p>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Advisor</p>
            <p className="mt-2 text-lg font-semibold text-white">{advisor?.name ?? 'Loading...'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="info">{clients.length} clients</Badge>
              <Badge variant="warning">{incompleteClients} onboarding gaps</Badge>
              <Badge variant="danger">{openServiceRequests} open SR</Badge>
            </div>
          </div>
          <Badge variant="info">Active</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Pending alerts</h2>
                <p className="mt-2 text-slate-400">Review items requiring follow-up across client portfolios.</p>
              </div>
              <Badge variant="danger">{alerts.length} Alerts</Badge>
            </div>
            <div className="mt-6 space-y-3">
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-100">{a.message}</p>
                    <Badge variant={a.severity === 'high' ? 'danger' : a.severity === 'medium' ? 'warning' : 'info'}>{a.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{a.createdAt}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Top clients by AUM</h2>
                <p className="mt-2 text-slate-400">Your highest-balance client relationships right now.</p>
              </div>
              <Badge variant="info">Top 5</Badge>
            </div>
            <div className="mt-6 space-y-3">
              {topClientsByAum.map((client) => (
                <div key={client.clientId} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-slate-100 font-medium">{client.name}</p>
                    <p className="text-slate-500 text-sm">{client.clientId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-100 font-semibold">${client.aum.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                    <p className="text-slate-400 text-xs">Balance</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Advisor AUM</div>
                  <div className="mt-2 text-2xl font-semibold">${aum !== null ? aum.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                      <TimeSeriesChart values={aumMiniSeries} width={120} height={36} />
                      <button
                        className="rounded-2xl bg-brand-500 px-3 py-1 text-slate-900 font-semibold"
                        onClick={async () => {
                          const r = await simulatePortfolioEvent()
                          setSimMessage(r.details)
                          fetchMock<Portfolio[]>('portfolios').then((list) => {
                            setPortfolios(list)
                            setAum(list.reduce((s, p) => s + p.accounts.reduce((a: number, ac: any) => a + (ac.balance || 0), 0), 0))
                          })
                          fetchMock<PortfolioSnapshot[]>('portfolioSnapshots').then((snapshots) => {
                            setAumSnapshots(snapshots)
                            if (snapshots.length) setAum(snapshots[0].aum)
                          })
                          setTimeout(() => setSimMessage(null), 4000)
                        }}
                      >
                        Simulate
                      </button>
                      {simMessage && <div className="text-sm text-slate-300">{simMessage}</div>}
                </div>
              </div>
            </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent interactions</h2>
                <p className="mt-2 text-slate-400">Latest calls, meetings, and client touchpoints.</p>
              </div>
              <Badge variant="success">{interactions.length}</Badge>
            </div>
            <div className="mt-6 space-y-3">
              {interactions.slice(0, 6).map((it) => (
                <div key={it.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-100">{it.type}</p>
                    <span className="text-xs text-slate-500">{it.date}</span>
                  </div>
                  <p className="mt-2 text-slate-300">{it.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Onboarding</p>
                <p className="mt-2 text-lg font-semibold text-white">3 clients in progress</p>
              </div>
              <Badge variant="warning">In review</Badge>
            </div>
            <p className="mt-4 text-slate-400">1 client awaiting final documentation and compliance validation.</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Follow-ups</p>
                <p className="mt-2 text-lg font-semibold text-white">{tasks.length} tasks</p>
              </div>
              <Badge variant="info">Current</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.slice(0, 5).map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-sm font-medium text-slate-100">{t.title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{t.dueDate || 'No due date'}</span>
                    <span>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-white">Portfolio alerts</h3>
            <p className="mt-3 text-slate-400">Monitor portfolio event summaries for client holdings.</p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
              No high-severity portfolio notifications at this time.
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
