import React from 'react'

export default function Topbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Advisor Workstation</p>
          <h2 className="text-xl font-semibold text-white">Client and CRM operations</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300">Notifications</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300">Reports</div>
          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300">CH</div>
        </div>
      </div>
    </div>
  )
}
