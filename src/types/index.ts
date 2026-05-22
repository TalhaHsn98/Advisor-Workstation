export type Advisor = {
  id: string
  name: string
  role?: string
}

export type AlertItem = {
  id: string
  clientId?: string
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
  createdAt: string
}

export type TaskItem = {
  id: string
  title: string
  clientId?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'open' | 'in_progress' | 'done'
}

export type Interaction = {
  id: string
  clientId: string
  type: string
  date: string
  advisorId: string
  summary: string
}
