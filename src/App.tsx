import { useState } from 'react'

import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'



import DashboardPage from './pages/DashboardPage'
import MaintenancePage from './pages/MaintenancePage'
import SettingsPage from './pages/SettingsPage'
import { useAuth } from './auth/useAuth'
import RofPage from './pages/RofPage'
import type { Page } from './types/navigation'


function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function App() {
 
  const [activePage, setActivePage] =
    useState<Page>('dashboard')

const { isAuthenticated } = useAuth()

  function renderPage() {
    switch (activePage) {
    case 'dashboard':
  return (
    <DashboardPage
      onNavigate={setActivePage}
    />
  )

      case 'finance-insight':
        return (
          <PlaceholderPage
            title="Finance Insight"
            description="Financial analytics and sales insights."
          />
        )

      case 'hourly-sales':
        return (
          <PlaceholderPage
            title="Hourly Sales"
            description="Hourly POS sales reporting."
          />
        )

      case 'system-sales':
        return (
          <PlaceholderPage
            title="System Sales"
            description="System sales reporting and analysis."
          />
        )

      case 'menu-item':
        return (
          <PlaceholderPage
            title="Menu Item"
            description="Menu item reporting and analysis."
          />
        )

      case 'pos-journal':
        return (
          <PlaceholderPage
            title="POS Journal"
            description="POS journal transaction viewer."
          />
        )

      case 'rof':
  return <RofPage />

      case 'deposit':
        return (
          <PlaceholderPage
            title="Deposit Monitoring"
            description="Deposit monitoring and reconciliation."
          />
        )

      case 'maintenance':
        return <MaintenancePage />

      case 'settings':
        return <SettingsPage />

      default:
       <DashboardPage
      onNavigate={setActivePage}
    />
    }
  }

if (!isAuthenticated) {
  return <LoginPage />
}

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App