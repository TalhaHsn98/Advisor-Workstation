import React, { useEffect, useMemo, useState } from 'react'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { Portfolio } from '../types/portfolio'
import { Client } from '../types/client'

interface WorksheetRow {
  accountId: string
  description: string
  value: string
  note: string
}

export default function NetWorthWorksheetPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [rows, setRows] = useState<WorksheetRow[]>([])
  const [manualTotal, setManualTotal] = useState<number>(0)
  const [lastCalculation, setLastCalculation] = useState<number | null>(null)

  useEffect(() => {
    fetchMock<Client[]>('clients').then(setClients)
    fetchMock<Portfolio[]>('portfolios').then(setPortfolios)
  }, [])

  const selectedClient = clients.find((client) => client.id === selectedClientId)
  const clientPortfolio = useMemo(
    () => portfolios.find((portfolio) => portfolio.clientId === selectedClientId) || null,
    [portfolios, selectedClientId]
  )

  useEffect(() => {
    if (!clientPortfolio) {
      setRows([])
      return
    }

    setRows(
      clientPortfolio.accounts.map((account) => ({
        accountId: account.accountId,
        description: account.accountType,
        value: account.balance?.toString() || '0',
        note: ''
      }))
    )
  }, [clientPortfolio])

  const totalAuto = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.value || 0), 0),
    [rows]
  )

  const handleRowChange = (index: number, field: keyof WorksheetRow, value: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)))
  }

  const recalculate = () => {
    const calculated = rows.reduce((sum, row) => sum + Number(row.value.replace(/[^0-9.-]/g, '') || 0), 0)
    setManualTotal(calculated)
    setLastCalculation(calculated)
  }

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Net Worth Worksheet</h1>
        <p className="mt-1 text-slate-400">Manual spreadsheet-style calculation of account balances before client calls.</p>
      </header>

      <Card>
        <SectionHeader title="Client selection" subtitle="Pick a client, then manually review each account." />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand-500"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <button
            onClick={recalculate}
            className="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-brand-400"
            disabled={!selectedClientId}
          >
            Recalculate Total
          </button>
        </div>
        <p className="mt-3 text-slate-400 text-sm">Use the value field as your working spreadsheet. Press Recalculate after editing.</p>
      </Card>

      <Card>
        <SectionHeader title="Worksheet" subtitle="Edit values manually in each row." />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full table-auto text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-3">Account ID</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row, index) => (
                  <tr key={row.accountId} className="border-b border-slate-800 hover:bg-slate-900/80">
                    <td className="px-3 py-3 text-slate-100">{row.accountId}</td>
                    <td className="px-3 py-3">{row.description}</td>
                    <td className="px-3 py-3">
                      <input
                        value={row.value}
                        onChange={(event) => handleRowChange(index, 'value', event.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.note}
                        onChange={(event) => handleRowChange(index, 'note', event.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                        placeholder="Advisor notes"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-slate-400">
                    Select a client to populate the worksheet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Manual total</div>
            <div className="mt-2 text-2xl font-semibold text-white">${manualTotal.toLocaleString('en-US')}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-slate-400 text-xs uppercase tracking-[0.18em]">Last calculated total</div>
            <div className="mt-2 text-2xl font-semibold text-white">{lastCalculation !== null ? `$${lastCalculation.toLocaleString('en-US')}` : 'Not calculated'}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Working assumptions" subtitle="Document your manual net worth assumptions." />
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-400 text-sm">
          This worksheet is intentionally manual. Use the value column to enter the numbers you want to present to the client. The application does not automatically aggregate household relationships.
        </div>
      </Card>
    </div>
  )
}
