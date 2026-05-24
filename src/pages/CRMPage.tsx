import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Badge, Card, DataTable, SectionHeader } from '../components/ui'
import { fetchMock, createCrmNote } from '../lib/mockService'
import CRMNotesList from '../components/CRMNotesList'
import { Client } from '../types/client'
import { CRMNote } from '../types/crmNote'
import { Interaction, TaskItem } from '../types'
import { ServiceRequest } from '../types/serviceRequest'
import { AlternativeInvestment, AttachmentItem } from '../types/alternativeInvestment'

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

  // Alternative investments (AS-IS) - stored per-client in localStorage
  const ALT_KEY_PREFIX = 'advisor-alt-investments-'
  const [altData, setAltData] = useState<{ investments: AlternativeInvestment[]; attachments: AttachmentItem[] }>({ investments: [], attachments: [] })
  const [newInvName, setNewInvName] = useState('')
  const [newInvCustodian, setNewInvCustodian] = useState('')
  const [newInvCommitment, setNewInvCommitment] = useState<string>('')
  const [newInvDistributions, setNewInvDistributions] = useState<string>('')
  const [newInvValuation, setNewInvValuation] = useState<string>('')
  const [newInvNotes, setNewInvNotes] = useState('')
  const [uploadCustodian, setUploadCustodian] = useState('')

  useEffect(() => {
    if (!selectedClientId) return
    try {
      const raw = localStorage.getItem(ALT_KEY_PREFIX + selectedClientId)
      if (raw) setAltData(JSON.parse(raw))
      else setAltData({ investments: [], attachments: [] })
    } catch (e) {
      setAltData({ investments: [], attachments: [] })
    }
  }, [selectedClientId])

  const saveAltToStorage = (next: { investments: AlternativeInvestment[]; attachments: AttachmentItem[] }) => {
    if (!selectedClientId) return
    try {
      localStorage.setItem(ALT_KEY_PREFIX + selectedClientId, JSON.stringify(next))
      setAltData(next)
    } catch (e) {
      alert('Failed to save alternative investments locally')
    }
  }

  const addInvestment = () => {
    if (!newInvName.trim() || !selectedClientId) return alert('Provide a name and select a client')
    const inv: AlternativeInvestment = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newInvName.trim(),
      custodian: newInvCustodian.trim() || undefined,
      commitment: newInvCommitment ? Number(newInvCommitment) : undefined,
      distributions: newInvDistributions ? Number(newInvDistributions) : undefined,
      lastValuation: newInvValuation ? Number(newInvValuation) : undefined,
      lastUpdated: new Date().toISOString(),
      notes: newInvNotes || undefined,
      attachments: []
    }
    const next = { investments: [inv, ...altData.investments], attachments: altData.attachments }
    saveAltToStorage(next)
    setNewInvName('')
    setNewInvCustodian('')
    setNewInvCommitment('')
    setNewInvDistributions('')
    setNewInvValuation('')
    setNewInvNotes('')
  }

  const deleteInvestment = (id: string) => {
    const next = { investments: altData.investments.filter((i) => i.id !== id), attachments: altData.attachments }
    saveAltToStorage(next)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedClientId) return
    if (file.type !== 'application/pdf') return alert('Only PDF statements are supported in this AS-IS view')
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const att: AttachmentItem = { id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: file.name, uploadedAt: new Date().toISOString(), custodian: uploadCustodian || undefined, dataUrl }
      const next = { investments: altData.investments, attachments: [att, ...altData.attachments] }
      saveAltToStorage(next)
      setUploadCustodian('')
      // clear file input
      if (e.target) e.target.value = ''
      alert('Statement uploaded (stored locally)')
    }
    reader.readAsDataURL(file)
  }

  const deleteAttachment = (id: string) => {
    const next = { investments: altData.investments, attachments: altData.attachments.filter((a) => a.id !== id) }
    saveAltToStorage(next)
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
              <Card>
                <SectionHeader title="Alternative Investments (AS-IS)" subtitle="Manual tracking of private/alternative assets. No automation." />
                <div className="mt-4 space-y-4">
                  {!selectedClient ? (
                    <div className="text-slate-400">Select a client to view alternative investments.</div>
                  ) : (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-slate-400 text-sm">Name</label>
                          <input value={newInvName} onChange={(e) => setNewInvName(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                          <label className="text-slate-400 text-sm">Custodian / Source</label>
                          <input value={newInvCustodian} onChange={(e) => setNewInvCustodian(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-slate-400 text-sm">Commitment</label>
                          <input value={newInvCommitment} onChange={(e) => setNewInvCommitment(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                          <label className="text-slate-400 text-sm">Distributions</label>
                          <input value={newInvDistributions} onChange={(e) => setNewInvDistributions(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Last valuation</label>
                        <div className="flex gap-3 mt-2">
                          <input value={newInvValuation} onChange={(e) => setNewInvValuation(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                          <button onClick={addInvestment} className="rounded-2xl bg-brand-500 px-4 py-2 text-slate-900">Add investment</button>
                        </div>
                        <label className="text-slate-400 text-sm mt-2 block">Notes</label>
                        <textarea value={newInvNotes} onChange={(e) => setNewInvNotes(e.target.value)} rows={3} className="w-full mt-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                      </div>

                      <div className="pt-2 border-t border-slate-800" />

                      <div>
                        <h3 className="text-lg font-medium">Statement uploads</h3>
                        <p className="text-slate-400 text-sm">Upload PDF statements manually. Files are stored locally in your browser (AS-IS).</p>
                        <div className="mt-3 flex gap-2 items-center">
                          <input type="text" placeholder="Custodian / Source" value={uploadCustodian} onChange={(e) => setUploadCustodian(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
                          <input type="file" accept="application/pdf" onChange={onFileChange} className="text-sm text-slate-400" />
                        </div>
                        <div className="mt-4 space-y-2">
                          {altData.attachments.length ? (
                            altData.attachments.map((att) => (
                              <div key={att.id} className="flex items-center justify-between rounded-2xl bg-slate-950 p-3">
                                <div>
                                  <div className="font-medium text-slate-100">{att.name}</div>
                                  <div className="text-xs text-slate-400">{att.custodian || 'Unknown source'} • {new Date(att.uploadedAt).toLocaleString()}</div>
                                </div>
                                <div className="flex gap-2">
                                  <a href={att.dataUrl} target="_blank" rel="noreferrer" className="text-slate-300 underline">Open</a>
                                  <a href={att.dataUrl} download={att.name} className="text-slate-300 underline">Download</a>
                                  <button onClick={() => deleteAttachment(att.id)} className="text-red-400">Delete</button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-400">No statements uploaded for this client.</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium">Tracked investments</h3>
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full table-auto text-left text-sm text-slate-300">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400">
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Custodian</th>
                                <th className="px-3 py-2">Commitment</th>
                                <th className="px-3 py-2">Distributions</th>
                                <th className="px-3 py-2">Valuation</th>
                                <th className="px-3 py-2">Last updated</th>
                                <th className="px-3 py-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {altData.investments.length ? (
                                altData.investments.map((inv) => (
                                  <tr key={inv.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                                    <td className="px-3 py-2 text-slate-100">{inv.name}</td>
                                    <td className="px-3 py-2">{inv.custodian || '(none)'}</td>
                                    <td className="px-3 py-2">{inv.commitment?.toLocaleString() || '(blank)'}</td>
                                    <td className="px-3 py-2">{inv.distributions?.toLocaleString() || '(blank)'}</td>
                                    <td className="px-3 py-2">{inv.lastValuation?.toLocaleString() || '(blank)'}</td>
                                    <td className="px-3 py-2">{inv.lastUpdated ? new Date(inv.lastUpdated).toLocaleDateString() : '(blank)'}</td>
                                    <td className="px-3 py-2"><button onClick={() => deleteInvestment(inv.id)} className="text-red-400">Delete</button></td>
                                  </tr>
                                ))
                              ) : (
                                <tr><td colSpan={7} className="px-3 py-4 text-slate-400">No alternative investments tracked for this client.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
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
