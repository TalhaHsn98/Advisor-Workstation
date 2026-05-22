import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, DataTable, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { Client } from '../types/client'
import { ServiceRequest } from '../types/serviceRequest'

const statusVariant: Record<ServiceRequest['status'], 'info' | 'warning' | 'danger' | 'success'> = {
  pending: 'warning',
  open: 'info',
  escalated: 'danger',
  closed: 'success'
}

const statusLabel: Record<ServiceRequest['status'], string> = {
  pending: 'Pending',
  open: 'Open',
  escalated: 'Escalated',
  closed: 'Closed'
}

export default function ServiceRequestsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | ServiceRequest['status']>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
    fetchMock<ServiceRequest[]>('serviceRequests').then(setRequests)
  }, [])

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients]
  )

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const statusMatch = filterStatus === 'all' || request.status === filterStatus
      const priorityMatch = filterPriority === 'all' || request.priority === filterPriority
      return statusMatch && priorityMatch
    })
  }, [requests, filterStatus, filterPriority])

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? filteredRequests[0] ?? null,
    [requests, selectedRequestId, filteredRequests]
  )

  useEffect(() => {
    if (!selectedRequestId && filteredRequests.length > 0) {
      setSelectedRequestId(filteredRequests[0].id)
    }
  }, [filteredRequests, selectedRequestId])

  const updateRequestStatus = (requestId: string, nextStatus: ServiceRequest['status'], actionLabel: string) => {
    const timestamp = new Date().toISOString().slice(0, 10)
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: nextStatus,
              history: [...request.history, { timestamp, user: 'System', action: actionLabel, note: `Status updated to ${statusLabel[nextStatus]}.` }]
            }
          : request
      )
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Service Requests</h1>
          <p className="text-slate-400 mt-1">Track request status, escalations, and request details for clients.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="info">{requests.length} Total</Badge>
          <Badge variant="warning">{filteredRequests.filter((req) => req.status === 'pending').length} Pending</Badge>
          <Badge variant="danger">{filteredRequests.filter((req) => req.status === 'escalated').length} Escalated</Badge>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <Card>
            <SectionHeader title="Request Pipeline" subtitle="Filter by status and priority to focus on urgent work." />
            <div className="mt-6 flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-brand-500"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(event) => setFilterPriority(event.target.value as typeof filterPriority)}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-brand-500"
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="mt-6">
              <DataTable
                data={filteredRequests}
                columns={[
                  { header: 'Request', accessor: (request) => request.summary ?? 'Summary unavailable' },
                  { header: 'Client', accessor: (request) => clientMap[request.clientId] ?? 'Unknown' },
                  {
                    header: 'Status',
                    accessor: (request) => <Badge variant={statusVariant[request.status]}>{statusLabel[request.status]}</Badge>
                  },
                  { header: 'Priority', accessor: (request) => <Badge variant={request.priority === 'high' ? 'danger' : request.priority === 'medium' ? 'warning' : 'success'}>{request.priority}</Badge> },
                  { header: 'Updated', accessor: (request) => request.createdAt }
                ]}
                emptyText="No service requests match the selected criteria."
                className="mt-4"
              />
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionHeader title="Request Details" subtitle={selectedRequest ? statusLabel[selectedRequest.status] : 'Select a request from the list.'} />
            {selectedRequest ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-slate-950 p-5">
                  <div className="text-slate-400 text-sm">Client</div>
                  <div className="mt-2 text-lg font-semibold text-slate-100">{clientMap[selectedRequest.clientId] ?? 'Unknown client'}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 p-5">
                  <div className="text-slate-400 text-sm">Summary</div>
                  <p className="mt-2 text-slate-200">{selectedRequest.summary || 'No summary provided.'}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-slate-400 text-sm">Assigned to</div>
                      <div className="mt-1 text-slate-100">{selectedRequest.assigneeId || 'Unassigned'}</div>
                    </div>
                    <Badge variant={statusVariant[selectedRequest.status]}>{statusLabel[selectedRequest.status]}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-900 p-4">
                      <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Priority</div>
                      <div className="mt-2 text-lg font-semibold text-slate-100">{selectedRequest.priority}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-4">
                      <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Created</div>
                      <div className="mt-2 text-lg font-semibold text-slate-100">{selectedRequest.createdAt}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedRequest.status !== 'closed' && (
                    <Button
                      variant="secondary"
                      onClick={() => updateRequestStatus(selectedRequest.id, 'closed', 'Closed request')}
                    >
                      Close Request
                    </Button>
                  )}
                  {selectedRequest.status !== 'escalated' && selectedRequest.status !== 'closed' && (
                    <Button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'escalated', 'Escalated request')}
                    >
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-400">Select a request to view details and take action.</div>
            )}
          </Card>

          <Card>
            <SectionHeader title="Request History" subtitle="Audit trail for the selected service request." />
            <div className="mt-6 space-y-3">
              {selectedRequest?.history.length ? (
                selectedRequest.history.map((entry, index) => (
                  <div key={index} className="rounded-2xl bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3 text-slate-400 text-xs uppercase tracking-[0.18em]">
                      <span>{entry.timestamp}</span>
                      <span>{entry.user}</span>
                    </div>
                    <div className="mt-2 font-medium text-slate-100">{entry.action}</div>
                    {entry.note ? <p className="mt-1 text-slate-400 text-sm">{entry.note}</p> : null}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No history available for this request.</div>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
