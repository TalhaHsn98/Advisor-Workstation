import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Badge, Card, DataTable, SectionHeader } from '../components/ui'
import { fetchMock, createCrmNote } from '../lib/mockService'
import CRMNotesList from '../components/CRMNotesList'
import { Client } from '../types/client'
import { CRMNote } from '../types/crmNote'
import { Interaction, TaskItem } from '../types'
import { ServiceRequest } from '../types/serviceRequest'

export default function CRMPage() {
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(routeClientId)
  const [notes, setNotes] = useState<CRMNote[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
    fetchMock<CRMNote[]>('crmNotes').then(setNotes)
    fetchMock<Interaction[]>('interactions').then(setInteractions)
    fetchMock<TaskItem[]>('tasks').then(setTasks)
    fetchMock<ServiceRequest[]>('serviceRequests').then(setServiceRequests)
  }, [])

  useEffect(() => {
    if (routeClientId) {
      setSelectedClientId(routeClientId)
    }
  }, [routeClientId])

  useEffect(() => {
    if (!routeClientId && clients.length && !selectedClientId) {
      setSelectedClientId(clients[0].id)
    }
  }, [clients, routeClientId, selectedClientId])

  const clientOptions = useMemo(
    () => [{ id: '', name: 'All clients' }, ...clients],
    [clients]
  )

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId]
  )

  const taskClientMap = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients]
  )

  const filteredNotes = useMemo(
    () => (selectedClientId ? notes.filter((entry) => entry.clientId === selectedClientId) : notes),
    [notes, selectedClientId]
  )

  const filteredInteractions = useMemo(
    () => (selectedClientId ? interactions.filter((interaction) => interaction.clientId === selectedClientId) : interactions),
    [interactions, selectedClientId]
  )

  const filteredTasks = useMemo(
    () => (selectedClientId ? tasks.filter((task) => task.clientId === selectedClientId) : tasks),
    [tasks, selectedClientId]
  )

  const meetingHistory = useMemo(
    () => filteredInteractions.filter((interaction) => interaction.type === 'meeting'),
    [filteredInteractions]
  )

  const reminders = useMemo(
    () => filteredTasks.filter((task) => task.status !== 'done').slice(0, 5),
    [filteredTasks]
  )

  const followUps = useMemo(
    () => filteredTasks.filter((task) => task.status === 'open').slice(0, 5),
    [filteredTasks]
  )

  const filteredRequests = useMemo(
    () => (selectedClientId ? serviceRequests.filter((request) => request.clientId === selectedClientId) : serviceRequests),
    [serviceRequests, selectedClientId]
  )

  const requestCounts = useMemo(() => {
    return filteredRequests.reduce<Record<string, number>>((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1
      return acc
    }, {})
  }, [filteredRequests])

  const nextActionQueue = useMemo(() => {
    const taskEntries = followUps.map((task) => ({
      id: task.id,
      channel: 'Task',
      title: task.title,
      client: taskClientMap[task.clientId] || 'Unknown',
      due: task.dueDate || 'ASAP',
      priority: task.priority || 'medium',
      status: task.status || 'open'
    }))

    const requestEntries = filteredRequests
      .filter((request) => request.status !== 'closed')
      .map((request) => ({
        id: request.id,
        channel: 'Service Request',
        title: request.summary || 'Review service request',
        client: taskClientMap[request.clientId] || 'Unknown',
        due: request.history?.[0]?.timestamp || request.createdAt || 'ASAP',
        priority: request.priority || 'medium',
        status: request.status
      }))

    return [...taskEntries, ...requestEntries]
      .sort((a, b) => {
        const priorityRank = { high: 0, medium: 1, low: 2 }
        const p = priorityRank[a.priority] - priorityRank[b.priority]
        if (p !== 0) return p
        return a.due.localeCompare(b.due)
      })
      .slice(0, 5)
  }, [followUps, filteredRequests, taskClientMap])

  const notesByClient = useMemo(
    () => filteredNotes.slice(0, 5),
    [filteredNotes]
  )

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId || undefined)
    navigate(clientId ? `/crm/${clientId}` : '/crm')
  }

  const addNote = () => {
    if (!newNote.trim() || !selectedClientId) return

    createCrmNote({ clientId: selectedClientId, advisorId: 'adv-1', content: newNote.trim() }).then((note) => {
      setNotes((current) => [note, ...current])
      setNewNote('')
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">CRM</h1>
          <p className="text-slate-400 mt-1">Advisor notes, meetings, reminders, follow-ups, and client interactions in one place.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <label className="flex items-center gap-3 text-slate-300">
            <span className="text-sm text-slate-400">Client scope</span>
            <select
              value={selectedClientId ?? ''}
              onChange={(event) => handleClientChange(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-brand-500"
            >
              {clientOptions.map((clientOption) => (
                <option key={clientOption.id} value={clientOption.id} className="bg-slate-950 text-slate-100">
                  {clientOption.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Badge variant="info">{clients.length} Clients</Badge>
            <Badge variant="warning">{reminders.length} Reminders</Badge>
            <Badge variant="danger">{filteredRequests.filter((request) => request.status !== 'closed').length} Open SR</Badge>
            <Badge variant="success">{filteredNotes.length} Notes</Badge>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <SectionHeader title="Advisor Notes" subtitle="Quick capture across client portfolios." />
            <div className="mt-6 space-y-4">
              <textarea
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-500"
                placeholder="Log a note for your next client call..."
              />
              <div className="flex justify-end">
                <Button onClick={addNote} disabled={!newNote.trim()} className="px-5">
                  Add Note
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Recent Notes" subtitle="Review or update the top CRM entries." />
            <div className="mt-6 space-y-3">
              {selectedClient ? (
                <div className="text-slate-400 text-sm">Showing notes for {selectedClient.name}</div>
              ) : (
                <div className="text-slate-400 text-sm">Showing notes for all clients</div>
              )}
              <CRMNotesList notes={notesByClient} onChange={setNotes} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionHeader title="Upcoming Reminders" subtitle="Tasks that need advisor attention soon." />
            <div className="mt-6 space-y-3">
              {reminders.length ? (
                reminders.map((task) => (
                  <div key={task.id} className="rounded-2xl bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-100">{task.title}</p>
                      <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
                        {task.priority || 'low'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-slate-400 text-sm">Client: {taskClientMap[task.clientId] || 'Unknown'}</div>
                    <div className="mt-1 text-slate-500 text-xs">Due: {task.dueDate || 'TBD'}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No reminders at this time.</div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Service request pipeline" subtitle="Advisor requests and operations queue." />
            <div className="mt-6 space-y-4">
              <div className="flex gap-3 flex-wrap text-sm text-slate-400">
                <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-2">Open: {requestCounts.open || 0}</div>
                <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-2">Pending: {requestCounts.pending || 0}</div>
                <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-2">Escalated: {requestCounts.escalated || 0}</div>
                <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-2">Closed: {requestCounts.closed || 0}</div>
              </div>
              {filteredRequests.length ? (
                <DataTable
                  data={filteredRequests.slice(0, 6)}
                  columns={[
                    { header: 'Summary', accessor: (req) => req.summary || 'No summary' },
                    { header: 'Client', accessor: (req) => taskClientMap[req.clientId] || 'Unknown' },
                    { header: 'Priority', accessor: (req) => <Badge variant={req.priority === 'high' ? 'danger' : req.priority === 'medium' ? 'warning' : 'success'}>{req.priority}</Badge> },
                    { header: 'Status', accessor: (req) => <Badge variant={req.status === 'closed' ? 'success' : req.status === 'escalated' ? 'danger' : 'warning'}>{req.status}</Badge> }
                  ]}
                  emptyText="No service requests available."
                />
              ) : (
                <div className="text-slate-400">No service requests found for this client.</div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Next action queue" subtitle="Priority items for your next advisory workflow." />
            <div className="mt-6 space-y-3">
              {nextActionQueue.length ? (
                nextActionQueue.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-100 font-medium">{item.title}</p>
                        <p className="text-slate-400 text-sm">{item.channel} • {item.client}</p>
                      </div>
                      <Badge variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'success'}>{item.priority}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{item.status}</span>
                      <span>Due {item.due}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No immediate actions to display.</div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Follow-up Tasks" subtitle="Current open follow-ups for active clients." />
            <div className="mt-6 space-y-3">
              {followUps.length ? (
                <DataTable
                  data={followUps}
                  columns={[
                    { header: 'Task', accessor: (task) => task.title },
                    { header: 'Client', accessor: (task) => taskClientMap[task.clientId] || 'Unknown' },
                    { header: 'Due', accessor: (task) => task.dueDate || 'TBD' },
                    { header: 'Status', accessor: (task) => <Badge variant={task.status === 'done' ? 'success' : 'warning'}>{task.status}</Badge> }
                  ]}
                  emptyText="No follow-up tasks have been assigned."
                />
              ) : (
                <div className="text-slate-400">No open follow-up tasks.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <SectionHeader title="Meeting History" subtitle="Recent client meetings and advisor engagements." />
        <div className="mt-6 space-y-4">
          {meetingHistory.length ? (
            meetingHistory.map((meeting) => (
              <div key={meeting.id} className="rounded-2xl bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{meeting.summary}</p>
                    <div className="text-slate-400 text-sm">{meeting.date}</div>
                  </div>
                  <Badge variant="info">{taskClientMap[meeting.clientId] || 'Client'}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No meetings recorded yet.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
