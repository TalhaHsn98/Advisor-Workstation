import { mockData, MockKey } from './mock'
import { CRMNote } from '../types/crmNote'
import { TaskItem } from '../types'
import { PortfolioSnapshot } from '../types/portfolioSnapshot'

function delay<T>(ms: number, value: T) {
  return new Promise<T>((res) => setTimeout(() => res(value), ms))
}

function getTotalAum() {
  const portfolios = mockData.portfolios as any[]
  return portfolios.reduce((sum, p) => sum + p.accounts.reduce((s, a) => s + (a.balance || 0), 0), 0)
}

export async function fetchMock<T>(key: MockKey): Promise<T> {
  // simulate network latency
  // @ts-ignore
  const data = mockData[key]
  return delay(300 + Math.random() * 400, data) as Promise<T>
}

function persistToStorage() {
  try {
    if (typeof window === 'undefined') return
    const snapshot = JSON.stringify({ crmNotes: mockData.crmNotes, tasks: mockData.tasks, portfolioSnapshots: mockData.portfolioSnapshots })
    window.localStorage.setItem('advisor-mock-data', snapshot)
  } catch (e) {
    // ignore in non-browser environments
  }
}

function appendAumSnapshot(aum: number) {
  const date = new Date().toISOString().slice(0, 10)
  const snapshots = mockData.portfolioSnapshots as PortfolioSnapshot[]
  if (snapshots.length && snapshots[0].date === date) {
    snapshots[0].aum = aum
  } else {
    snapshots.unshift({ date, aum })
  }
  if (snapshots.length > 14) snapshots.splice(14)
  persistToStorage()
}

export async function createCrmNote(input: Omit<CRMNote, 'id' | 'createdAt'> & { content: string }): Promise<CRMNote> {
  const note: CRMNote = {
    id: `note-${Date.now()}`,
    clientId: input.clientId,
    advisorId: input.advisorId,
    createdAt: new Date().toISOString().slice(0, 10),
    content: input.content,
    tags: input.tags || []
  }

  mockData.crmNotes.unshift(note)
  persistToStorage()
  return delay(150, note)
}

export async function createTask(input: Omit<TaskItem, 'id' | 'status'>): Promise<TaskItem> {
  const task: TaskItem = {
    id: `task-${Date.now()}`,
    title: input.title,
    clientId: input.clientId,
    dueDate: input.dueDate,
    priority: input.priority || 'medium',
    status: 'open'
  }

  mockData.tasks.unshift(task)
  persistToStorage()
  return delay(150, task)
}

export async function updateCrmNote(id: string, content: string): Promise<CRMNote | null> {
  const idx = mockData.crmNotes.findIndex((n: CRMNote) => n.id === id)
  if (idx === -1) return delay(100, null)
  mockData.crmNotes[idx].content = content
  persistToStorage()
  return delay(120, mockData.crmNotes[idx])
}

export async function deleteCrmNote(id: string): Promise<boolean> {
  const idx = mockData.crmNotes.findIndex((n: CRMNote) => n.id === id)
  if (idx === -1) return delay(100, false)
  mockData.crmNotes.splice(idx, 1)
  persistToStorage()
  return delay(120, true)
}

export async function simulatePortfolioEvent(): Promise<{ alertCreated: boolean; details: string }> {
  const portfolios = mockData.portfolios as any[]
  if (!portfolios || portfolios.length === 0) return delay(100, { alertCreated: false, details: 'no portfolios' })

  const pIndex = Math.floor(Math.random() * portfolios.length)
  const portfolio = portfolios[pIndex]
  if (!portfolio.accounts || portfolio.accounts.length === 0) return delay(100, { alertCreated: false, details: 'no accounts' })

  const accIndex = Math.floor(Math.random() * portfolio.accounts.length)
  const account = portfolio.accounts[accIndex]
  if (!account.holdings || account.holdings.length === 0) return delay(100, { alertCreated: false, details: 'no holdings' })

  const hIndex = Math.floor(Math.random() * account.holdings.length)
  const holding = account.holdings[hIndex]

  const pct = (Math.random() * 16 - 8)
  const oldValue = holding.marketValue || 1000
  const newValue = Math.max(1, Math.round(oldValue * (1 + pct / 100)))
  holding.marketValue = newValue

  const oldBalance = account.balance || 0
  account.balance = Math.max(0, oldBalance + (newValue - oldValue))

  const severity = Math.abs(pct) >= 5 ? 'high' : Math.abs(pct) >= 2 ? 'medium' : 'low'
  const alert = {
    id: `alert-${Date.now()}`,
    clientId: portfolio.clientId,
    type: 'market-move',
    severity: severity,
    message: `${holding.ticker} moved ${pct.toFixed(1)}% (${oldValue} → ${newValue})`,
    createdAt: new Date().toISOString().slice(0, 10)
  }

  mockData.alerts.unshift(alert)
  appendAumSnapshot(getTotalAum())
  persistToStorage()

  return delay(180, { alertCreated: true, details: alert.message })
}
