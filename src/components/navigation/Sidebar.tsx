import { useState } from 'react'
import type { ReactNode } from 'react'


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

export type Page =
  | 'dashboard'
  | 'finance-insight'
  | 'hourly-sales'
  | 'system-sales'
  | 'menu-item'
  | 'pos-journal'
  | 'rof'
  | 'deposit'
  | 'maintenance'
  | 'settings'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
}

interface SidebarSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

interface NavItemProps {
  label: string
  page: Page
  icon: ReactNode
  activePage: Page
  onNavigate: (page: Page) => void
}

function NavItem({
  label,
  page,
  icon,
  activePage,
  onNavigate,
}: NavItemProps) {
  const active = activePage === page

  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={() => onNavigate(page)}
    >
      <span className="nav-icon">{icon}</span>

      <span className="nav-label">
        {label}
      </span>
    </button>
  )
}

interface SidebarSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function SidebarSection({
  title,
  defaultOpen = true,
  children,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="sidebar-section">

      <button
        className="section-header"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>

        {open ? (
          <ChevronDown size={15} />
        ) : (
          <ChevronRight size={15} />
        )}
      </button>

      <div
        className={`section-content ${
          open ? 'open' : 'closed'
        }`}
      >
        {children}
      </div>

    </div>
  )
}

function Sidebar({
  activePage,
  onNavigate,
  onLogout,
}: SidebarProps) {

  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="sidebar-header">

        <div className="logo-container">
          <img
            src={logo}
            alt="Oracle Reporting Tool"
            className="app-logo-image"
          />
        </div>

        <div className="brand-info">
          <div className="app-name">
            Oracle
          </div>

          <div className="app-subtitle">
            Reporting Tool
          </div>
        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="sidebar-nav">

        <SidebarSection title="DASHBOARD">

          <NavItem
            label="Dashboard"
            page="dashboard"
            icon={<LayoutDashboard size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          <NavItem
            label="Finance Insight"
            page="finance-insight"
            icon={<BarChart3 size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

        </SidebarSection>


        <SidebarSection title="REPORTS">

          <NavItem
            label="Hourly Sales"
            page="hourly-sales"
            icon={<Clock3 size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          <NavItem
            label="System Sales"
            page="system-sales"
            icon={<FileBarChart size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          <NavItem
            label="Menu Item"
            page="menu-item"
            icon={<Menu size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          <NavItem
            label="POS Journal"
            page="pos-journal"
            icon={<NotebookText size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

        </SidebarSection>


        <SidebarSection title="FINANCE">

          <NavItem
            label="ROF"
            page="rof"
            icon={<ReceiptText size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

          <NavItem
            label="Deposit Monitoring"
            page="deposit"
            icon={<WalletCards size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

        </SidebarSection>


        <SidebarSection title="SYSTEM">

          <NavItem
            label="Maintenance"
            page="maintenance"
            icon={<ShieldCheck size={18} />}
            activePage={activePage}
            onNavigate={onNavigate}
          />

        </SidebarSection>

      </nav>


      {/* FOOTER */}

   <div className="sidebar-footer">
  <button
    type="button"
    className="sidebar-footer-item"
    onClick={() => onNavigate('settings')}
  >
    <Settings size={18} />
    <span>Settings</span>
  </button>

  <button
    type="button"
    className="sidebar-footer-item logout-item"
    onClick={onLogout}
  >
    <LogOut size={18} />
    <span>Logout</span>
  </button>
</div>

    </aside>
  )
}

export default Sidebar