import {
  useState,
} from 'react'

import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MaintenancePage from './pages/MaintenancePage'
import SettingsPage from './pages/SettingsPage'
import RofPage from './pages/RofPage'
import DepositPage from './pages/DepositPage'

import {
  useAuth,
} from './auth/useAuth'

import type {
  Page,
} from './types/navigation'

function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h1 className="h4 fw-bold">
        {title}
      </h1>

      <p className="text-secondary">
        {description}
      </p>
    </div>
  )
}

function App() {
  const [
    activePage,
    setActivePage,
  ] =
    useState<Page>(
      'dashboard',
    )

  const {
    isAuthenticated,
  } = useAuth()

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={
              setActivePage
            }
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
  return <DepositPage />

      case 'maintenance':
        return (
          <MaintenancePage />
        )

      case 'settings':
        return (
          <SettingsPage />
        )

      default:
        return (
          <DashboardPage
            onNavigate={
              setActivePage
            }
          />
        )
    }
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <AppLayout
      activePage={
        activePage
      }
      onNavigate={
        setActivePage
      }
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App