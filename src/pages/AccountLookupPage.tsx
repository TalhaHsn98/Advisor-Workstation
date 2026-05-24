import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, SectionHeader } from '../components/ui'
import { fetchMock } from '../lib/mockService'
import { Portfolio } from '../types/portfolio'
import { Client } from '../types/client'

export default function AccountLookupPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [lastSearch, setLastSearch] = useState('')

  useEffect(() => {
    fetchMock<Portfolio[]>('portfolios').then(setPortfolios)
    fetchMock<Client[]>('clients').then(setClients)
  }, [])

  const clientNameMap = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients]
  )

  const results = useMemo(() => {
    if (!lastSearch.trim()) return []
    const term = lastSearch.trim().toLowerCase()
    const found: Array<{
      clientId: string
      clientName: string
      accountId: string
      accountType: string
      balance: number
    }> = []

    portfolios.forEach((portfolio) => {
      portfolio.accounts.forEach((account) => {
        if (account.accountId.toLowerCase().includes(term) || account.accountType.toLowerCase().includes(term)) {
          found.push({
            clientId: portfolio.clientId,
            clientName: clientNameMap[portfolio.clientId] || portfolio.clientId,
            accountId: account.accountId,
            accountType: account.accountType,
            balance: account.balance || 0
          })
        }
      })
    })

    return found
  }, [lastSearch, portfolios, clientNameMap])

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Account Lookup</h1>
        <p className="mt-1 text-slate-400">Search individual account numbers one by one, then open disconnected client records manually.</p>
      </header>

      <Card>
        <SectionHeader title="Manual account search" subtitle="Type an account number or partial value and press search." />
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Enter account number..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand-500"
            />
            <button
              onClick={() => setLastSearch(searchTerm)}
              className="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-brand-400"
            >
              Search
            </button>
          </div>
          <div className="text-slate-400 text-sm">The system does not auto-complete. You must enter account identifiers manually.</div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Search results" subtitle="Results appear only after you trigger the search." />
        <div className="mt-6 overflow-x-auto">
          {lastSearch.trim() ? (
            results.length ? (
              <table className="w-full table-auto text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-3 py-3">Client</th>
                    <th className="px-3 py-3">Account ID</th>
                    <th className="px-3 py-3">Account Type</th>
                    <th className="px-3 py-3">Balance</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={`${row.clientId}-${row.accountId}`} className="border-b border-slate-800 hover:bg-slate-900/80">
                      <td className="px-3 py-3 text-slate-100">{row.clientName}</td>
                      <td className="px-3 py-3">{row.accountId}</td>
                      <td className="px-3 py-3">{row.accountType}</td>
                      <td className="px-3 py-3">${row.balance.toLocaleString('en-US')}</td>
                      <td className="px-3 py-3">
                        <Link
                          to={`/clients/${row.clientId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-200 transition hover:bg-slate-900"
                        >
                          Open client record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-400">No accounts matched your search. Try a different account number.</div>
            )
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-400">Enter an account number and click Search to begin.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
