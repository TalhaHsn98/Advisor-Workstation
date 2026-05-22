export type ServiceRequest = {
  id: string
  clientId: string
  createdBy: string
  createdAt: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'open' | 'escalated' | 'closed'
  assigneeId?: string
  summary?: string
  history: Array<{ timestamp: string; user: string; action: string; note?: string }>
}
