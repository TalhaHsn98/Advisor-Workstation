import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ClientsListPage from './pages/ClientsListPage'
import Client360Page from './pages/Client360Page'
import CRMPage from './pages/CRMPage'
import AccountLookupPage from './pages/AccountLookupPage'
import NetWorthWorksheetPage from './pages/NetWorthWorksheetPage'
import PortfoliosPage from './pages/PortfoliosPage'
import ServiceRequestsPage from './pages/ServiceRequestsPage'
import SettingsPage from './pages/SettingsPage'
import StickyNotesPage from './pages/StickyNotesPage'
import RemindersPage from './pages/RemindersPage'
import RmdScannerPage from './pages/RmdScannerPage'
import PortfolioLoginPage from './pages/PortfolioLoginPage'
import TierReportPage from './pages/TierReportPage'

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsListPage />} />
          <Route path="clients/:clientId" element={<Client360Page />} />
          <Route path="accounts" element={<AccountLookupPage />} />
          <Route path="portfolio-login" element={<PortfolioLoginPage />} />
          <Route path="net-worth" element={<NetWorthWorksheetPage />} />
          <Route path="sticky-notes" element={<StickyNotesPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="rmd-scan" element={<RmdScannerPage />} />
          <Route path="tier-report" element={<TierReportPage />} />
          <Route path="portfolios" element={<PortfoliosPage />} />
          <Route path="portfolios/:clientId" element={<PortfoliosPage />} />
          <Route path="crm" element={<CRMPage />} />
          <Route path="crm/:clientId" element={<CRMPage />} />
          <Route path="service-requests" element={<ServiceRequestsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  )
}
