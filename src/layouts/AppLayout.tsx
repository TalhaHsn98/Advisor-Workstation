import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-80 border-r border-slate-800 bg-slate-950">
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
