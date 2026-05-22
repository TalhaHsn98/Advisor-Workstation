Advisor Workstation — Core User Stories

1. Advisor dashboard

- As an Advisor, I want a consolidated dashboard showing alerts, recent interactions, tasks, and portfolio notifications so I can prioritize my day.
- Acceptance: Dashboard shows actionable items, can open details or create follow-ups.

2. Client management

- As an Advisor, I want to search and filter clients, view `Client360` profiles, and jump to household/holding details so I can prepare for meetings.
- Acceptance: Client list supports name search, filters, and a detail route with tabs.

3. CRM notes & interactions

- As an Advisor, I want to create, edit, and view notes tied to a client, with timestamps and author info, so I can record client communications.
- Acceptance: Notes are editable in-place, saved to mock persistence, and visible in interaction history.

4. Tasks & follow-ups

- As an Advisor, I want to create tasks (follow-up, compliance, docs) from alerts or interactions, assign priority and due date, and mark complete.
- Acceptance: Tasks can be created from alert or client view; task list shows state and due dates.

5. Service requests

- As an Advisor, I want to create and manage service requests for operations (transfers, account changes), assign owners, and track lifecycle.
- Acceptance: Requests have states (open, in-progress, resolved) and history entries.

6. Meeting scheduling

- As an Advisor, I want to schedule meetings, add attendees, and create meeting notes so I can track outcomes.
- Acceptance: Meetings appear in client timeline and advisor calendar mock.

7. Alerts & portfolio events

- As an Advisor, I want portfolio event alerts with severity and suggested actions so I can act on significant changes.
- Acceptance: Alerts have severity badges and link to relevant holdings.

8. Reporting & export

- As an Advisor, I want to export client summaries and portfolio snapshots to PDF/CSV for compliance and client delivery.
- Acceptance: Export outputs mock files with current client snapshot.

Notes:

- Implementation will use mock JSON + in-memory persistence. Later we may add localStorage for session persistence.
- Prioritize CRM notes, tasks, and service request lifecycle for initial "interactive actions" sprint.
