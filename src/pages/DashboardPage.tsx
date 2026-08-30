import {
  Activity,
  Banknote,
  Calculator,
  Clock3,
  Database,
  FileText,
  Monitor,
  ReceiptText,
  Store,
  TrendingUp,
} from 'lucide-react'

import type { Page } from '../types/navigation'
import { useAuth } from '../auth/useAuth'

interface DashboardPageProps {
  onNavigate: (page: Page) => void
}

function DashboardPage({
  onNavigate,
}: DashboardPageProps) {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      {/* Welcome */}
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">
            OVERVIEW
          </p>

          <h1>
            Welcome back, {user?.username}
          </h1>

          <p>
            Here's an overview of your reporting
            environment.
          </p>
        </div>

        <div className="dashboard-location">
          <Store size={18} />

          <div>
            <span>Current Location</span>
            <strong>
              {user?.locationName || 'Not assigned'}
            </strong>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="dashboard-kpi-grid">
        <KpiCard
          title="Today's Sales"
          value="—"
          description="Gross sales today"
          icon={<Banknote size={20} />}
        />

        <KpiCard
          title="Transactions"
          value="—"
          description="Completed transactions"
          icon={<ReceiptText size={20} />}
        />

        <KpiCard
          title="Average Check"
          value="—"
          description="Average transaction value"
          icon={<Calculator size={20} />}
        />

        <KpiCard
          title="Active POS"
          value="—"
          description="Reporting terminals"
          icon={<Monitor size={20} />}
        />
      </section>

      <div className="dashboard-content-grid">
        {/* System Status */}
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>System Status</h2>
              <p>
                Current application environment
              </p>
            </div>

            <Activity size={19} />
          </div>

          <div className="system-info-list">
            <SystemInfo
              icon={<Database size={18} />}
              label="Database"
              value="Connected"
              status="success"
            />

            <SystemInfo
              icon={<TrendingUp size={18} />}
              label="Application"
              value="Running"
              status="success"
            />

            <SystemInfo
              icon={<Store size={18} />}
              label="Location"
              value={
                user?.locationName ||
                'Not assigned'
              }
            />

            <SystemInfo
              icon={<Clock3 size={18} />}
              label="Access"
              value={
                user?.role ||
                'Not assigned'
              }
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Quick Actions</h2>
              <p>
                Frequently used reports
              </p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <QuickAction
              icon={<Clock3 size={19} />}
              title="Hourly Sales"
              description="View hourly performance"
              onClick={() =>
                onNavigate('hourly-sales')
              }
            />

            <QuickAction
              icon={<TrendingUp size={19} />}
              title="System Sales"
              description="View sales summary"
              onClick={() =>
                onNavigate('system-sales')
              }
            />

            <QuickAction
              icon={<FileText size={19} />}
              title="POS Journal"
              description="Review POS transactions"
              onClick={() =>
                onNavigate('pos-journal')
              }
            />

            <QuickAction
              icon={<Banknote size={19} />}
              title="Deposit Monitoring"
              description="Review deposits"
              onClick={() =>
                onNavigate('deposit')
              }
            />
          </div>
        </section>
      </div>
    </div>
  )
}

interface KpiCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function KpiCard({
  title,
  value,
  description,
  icon,
}: KpiCardProps) {
  return (
    <article className="dashboard-kpi-card">
      <div className="dashboard-kpi-icon">
        {icon}
      </div>

      <div className="dashboard-kpi-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </article>
  )
}

interface SystemInfoProps {
  icon: React.ReactNode
  label: string
  value: string
  status?: 'success'
}

function SystemInfo({
  icon,
  label,
  value,
  status,
}: SystemInfoProps) {
  return (
    <div className="system-info-row">
      <div className="system-info-icon">
        {icon}
      </div>

      <div className="system-info-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      {status && (
        <span className="system-info-status">
          <span />
          Online
        </span>
      )}
    </div>
  )
}

interface QuickActionProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      className="quick-action"
      onClick={onClick}
    >
      <span className="quick-action-icon">
        {icon}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  )
}

export default DashboardPage