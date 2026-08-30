import {
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import Sidebar from '../components/navigation/Sidebar'
import TopHeader from '../components/navigation/TopHeader'
import ConfirmDialog from '../components/common/ConfirmDialog'

import type { Page } from '../components/navigation/Sidebar'

import { useAuth } from '../auth/useAuth'

interface AppLayoutProps {
  activePage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'

function getPageTitle(page: Page): string {
  switch (page) {
    case 'dashboard':
      return 'Dashboard'

    case 'finance-insight':
      return 'Finance Insight'

    case 'hourly-sales':
      return 'Hourly Sales'

    case 'system-sales':
      return 'System Sales'

    case 'menu-item':
      return 'Menu Item'

    case 'pos-journal':
      return 'POS Journal'

    case 'rof':
      return 'ROF'

    case 'deposit':
      return 'Deposit Monitoring'

    case 'maintenance':
      return 'Maintenance'

    case 'settings':
      return 'Settings'

    default:
      return 'Oracle Reporting Tool'
  }
}

function AppLayout({
  activePage,
  onNavigate,
  children,
}: AppLayoutProps) {
  const [appVersion, setAppVersion] = useState('v1.0.0')
const { user, logout } = useAuth()
  const [updateStatus] = useState<UpdateStatus>('idle')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    async function loadAppVersion() {
      try {
        if (!window.api?.app?.getVersion) {
          console.warn(
            'Electron API is not available. Using fallback version.',
          )

          return
        }

        const version =
          await window.api.app.getVersion()

        setAppVersion(`v${version}`)
      } catch (error) {
        console.error(
          'Unable to load application version:',
          error,
        )
      }
    }

    loadAppVersion()
  }, [])

 return (
  <div className="app-layout">
    <Sidebar
      activePage={activePage}
      onNavigate={onNavigate}
      onLogout={() =>
        setShowLogoutDialog(true)
      }
    />

    <div className="app-main">
      <TopHeader
        title={getPageTitle(activePage)}
        version={appVersion}
        updateStatus={updateStatus}
        userName={user?.displayName}
        userRole={user?.role}
      />

      <main className="main-content">
        {children}
      </main>
    </div>

    <ConfirmDialog
      open={showLogoutDialog}
      title="Sign out?"
      message="Are you sure you want to sign out of Oracle Reporting Tool?"
      cancelText="Cancel"
      confirmText="Sign Out"
      onCancel={() =>
        setShowLogoutDialog(false)
      }
      onConfirm={() => {
        setShowLogoutDialog(false)
        logout()
      }}
    />
  </div>
)
}

export default AppLayout