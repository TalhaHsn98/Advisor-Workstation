import advisor from './advisor.json'
import alerts from './alerts.json'
import clients from './clients.json'
import portfolios from './portfolios.json'
import holdings from './holdings.json'
import interactions from './interactions.json'
import tasks from './tasks.json'
import serviceRequests from './serviceRequests.json'
import crmNotes from './crmNotes.json'
import households from './households.json'
import portfolioSnapshots from './portfolioSnapshots.json'

export const mockData = {
  advisor,
  alerts,
  clients,
  portfolios,
  holdings,
  interactions,
  tasks,
  serviceRequests,
  crmNotes,
  households,
  portfolioSnapshots
}

export type MockKey = keyof typeof mockData
