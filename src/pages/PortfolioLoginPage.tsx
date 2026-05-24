import React, { useState } from 'react'
import { Card, SectionHeader } from '../components/ui'

export default function PortfolioLoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate separate portfolio system login by opening portfolios in a new tab
    window.open('/portfolios', '_blank')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Portfolio System</h1>
        <p className="text-slate-400 mt-1">Simulate logging into a separate portfolio system. This intentionally opens a new tab.</p>
      </header>

      <Card>
        <SectionHeader title="Login" subtitle="Open the portfolio screen in a separate tab for manual review." />
        <form onSubmit={login} className="mt-4 grid gap-3 sm:w-1/2">
          <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Username" className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100" />
          <div className="flex justify-end">
            <button type="submit" className="rounded-2xl bg-brand-500 px-4 py-2 font-semibold text-slate-900">Open Portfolio</button>
          </div>
        </form>
      </Card>
    </div>
  )
}
