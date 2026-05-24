import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/accounts', label: 'Account Lookup' },
  { to: '/portfolio-login', label: 'Portfolio Login' },
  { to: '/net-worth', label: 'Net Worth Worksheet' },
  { to: '/sticky-notes', label: 'Sticky Notes' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/rmd-scan', label: 'RMD Scanner' },
  { to: '/tier-report', label: 'Tiering (AS-IS)' },
  { to: '/portfolios', label: 'Portfolios' },
  { to: '/crm', label: 'CRM' },
  { to: '/service-requests', label: 'Service Requests' },
  { to: '/settings', label: 'Settings' }
]

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 shadow-soft">
      <div className="px-6 py-8 border-b border-slate-800">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Fidelity Advisor</div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Workstation</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 text-sm text-slate-300">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center rounded-2xl px-4 py-3 transition ${isActive ? 'bg-brand-500/10 text-brand-300 shadow-inner shadow-brand-500/10' : 'hover:bg-slate-900/80'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-5 border-t border-slate-800 text-xs text-slate-500">
        <div className="font-medium text-slate-200">Enterprise Mode</div>
        <div className="mt-1">v0.1 • Dark UX</div>
      </div>
    </div>
  )
}
