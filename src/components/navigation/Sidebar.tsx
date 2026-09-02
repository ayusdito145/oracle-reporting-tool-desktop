import {
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookText,
  ReceiptText,
  Settings,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

import logo from '../../assets/jco-logo.png'

import type {
  Page,
} from '../../types/navigation'

interface SidebarProps {
  activePage: Page

  onNavigate: (
    page: Page,
  ) => void

  onLogout: () => void
}

interface NavItemProps {
  label: string
  page: Page
  icon: ReactNode
  activePage: Page

  onNavigate: (
    page: Page,
  ) => void
}

interface SidebarSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

function NavItem({
  label,
  page,
  icon,
  activePage,
  onNavigate,
}: NavItemProps) {
  const active =
    activePage === page

  return (
    <button
      type="button"
      className={`
        sidebar-nav-item
        btn
        border-0
        w-100
        d-flex
        align-items-center
        gap-3
        text-start
        rounded-3
        px-3
        py-2

        ${
          active
            ? 'active'
            : ''
        }
      `}
      onClick={() =>
        onNavigate(page)
      }
    >
      <span className="d-flex align-items-center">
        {icon}
      </span>

      <span className="flex-grow-1">
        {label}
      </span>
    </button>
  )
}

function SidebarSection({
  title,
  defaultOpen = true,
  children,
}: SidebarSectionProps) {
  const [
    open,
    setOpen,
  ] =
    useState(
      defaultOpen,
    )

  return (
    <div className="mb-3">

      <button
        type="button"
        className="
          btn
          border-0
          w-100
          d-flex
          align-items-center
          justify-content-between
          px-3
          py-1
          text-secondary
          sidebar-section-title
        "
        onClick={() =>
          setOpen(
            (
              current,
            ) =>
              !current,
          )
        }
      >
        <span>
          {title}
        </span>

        {open ? (
          <ChevronDown
            size={14}
          />
        ) : (
          <ChevronRight
            size={14}
          />
        )}
      </button>

      {open && (
        <div className="d-grid gap-1 mt-1">
          {children}
        </div>
      )}

    </div>
  )
}

function Sidebar({
  activePage,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="app-sidebar bg-white border-end d-flex flex-column flex-shrink-0">

      <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom">

        <img
          src={logo}
          alt="Oracle Reporting Tool"
          className="sidebar-logo"
        />

        <div className="lh-sm">
          <div className="fw-bold">
            Oracle
          </div>

          <small className="text-secondary">
            Reporting Tool
          </small>
        </div>

      </div>

      <nav className="flex-grow-1 overflow-auto py-3 px-2">

        <SidebarSection title="DASHBOARD">

          <NavItem
            label="Dashboard"
            page="dashboard"
            icon={
              <LayoutDashboard
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

          <NavItem
            label="Finance Insight"
            page="finance-insight"
            icon={
              <BarChart3
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

        </SidebarSection>

        <SidebarSection title="REPORTS">

          <NavItem
            label="Hourly Sales"
            page="hourly-sales"
            icon={
              <Clock3
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

          <NavItem
            label="System Sales"
            page="system-sales"
            icon={
              <FileBarChart
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

          <NavItem
            label="Menu Item"
            page="menu-item"
            icon={
              <Menu
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

          <NavItem
            label="POS Journal"
            page="pos-journal"
            icon={
              <NotebookText
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

        </SidebarSection>

        <SidebarSection title="FINANCE">

          <NavItem
            label="ROF"
            page="rof"
            icon={
              <ReceiptText
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

          <NavItem
            label="Deposit Monitoring"
            page="deposit"
            icon={
              <WalletCards
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

        </SidebarSection>

        <SidebarSection title="SYSTEM">

          <NavItem
            label="Maintenance"
            page="maintenance"
            icon={
              <ShieldCheck
                size={18}
              />
            }
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />

        </SidebarSection>

      </nav>

      <div className="border-top p-2">

        <button
          type="button"
          className="
            btn
            border-0
            w-100
            d-flex
            align-items-center
            gap-3
            text-start
            rounded-3
            px-3
            py-2
          "
          onClick={() =>
            onNavigate(
              'settings',
            )
          }
        >
          <Settings
            size={18}
          />

          <span>
            Settings
          </span>
        </button>

        <button
          type="button"
          className="
            btn
            border-0
            w-100
            d-flex
            align-items-center
            gap-3
            text-start
            rounded-3
            px-3
            py-2
            text-danger
          "
          onClick={
            onLogout
          }
        >
          <LogOut
            size={18}
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  )
}

export default Sidebar