import type {
  ReactNode,
} from 'react'

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

import type {
  Page,
} from '../types/navigation'

import {
  useAuth,
} from '../auth/useAuth'

interface DashboardPageProps {
  onNavigate: (
    page: Page,
  ) => void
}

function DashboardPage({
  onNavigate,
}: DashboardPageProps) {
  const {
    user,
  } = useAuth()

  return (
    <div className="container-fluid p-0">

      {/* Welcome */}

      <section
        className="
          bg-white
          border
          rounded-4
          p-4
          mb-4
        "
      >
        <div
          className="
            d-flex
            flex-column
            flex-lg-row
            align-items-lg-center
            justify-content-between
            gap-3
          "
        >
          <div>
            <div
              className="
                text-uppercase
                fw-bold
                small
                brand-text
                mb-2
              "
            >
              Overview
            </div>

            <h1 className="h4 fw-bold mb-2">
              Welcome back,{' '}
              {user?.username}
            </h1>

            <p className="text-secondary mb-0">
              Here's an overview of
              your reporting environment.
            </p>
          </div>

          <div
            className="
              d-flex
              align-items-center
              gap-3
              bg-light
              border
              rounded-3
              px-3
              py-2
            "
          >
            <div className="dashboard-icon-box">
              <Store
                size={18}
              />
            </div>

            <div className="lh-sm">
              <small
                className="
                  text-secondary
                  d-block
                  mb-1
                "
              >
                Current Location
              </small>

              <strong>
                {user?.locationName ||
                  'Not assigned'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}

      <section className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Today's Sales"
            value="—"
            description="Gross sales today"
            icon={
              <Banknote
                size={20}
              />
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Transactions"
            value="—"
            description="Completed transactions"
            icon={
              <ReceiptText
                size={20}
              />
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Average Check"
            value="—"
            description="Average transaction value"
            icon={
              <Calculator
                size={20}
              />
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Active POS"
            value="—"
            description="Reporting terminals"
            icon={
              <Monitor
                size={20}
              />
            }
          />
        </div>

      </section>

      {/* Bottom cards */}

      <section className="row g-3">

        <div className="col-12 col-xl-6">
          <div
            className="
              card
              border
              rounded-4
              h-100
            "
          >
            <div
              className="
                card-header
                bg-white
                border-bottom
                d-flex
                align-items-center
                justify-content-between
                py-3
              "
            >
              <div>
                <h2 className="h6 fw-bold mb-1">
                  System Status
                </h2>

                <p className="small text-secondary mb-0">
                  Current application
                  environment
                </p>
              </div>

              <div className="dashboard-icon-box">
                <Activity
                  size={19}
                />
              </div>
            </div>

            <div className="card-body p-0">

              <SystemInfo
                icon={
                  <Database
                    size={18}
                  />
                }
                label="Database"
                value="Connected"
                status="success"
              />

              <SystemInfo
                icon={
                  <TrendingUp
                    size={18}
                  />
                }
                label="Application"
                value="Running"
                status="success"
              />

              <SystemInfo
                icon={
                  <Store
                    size={18}
                  />
                }
                label="Location"
                value={
                  user?.locationName ||
                  'Not assigned'
                }
              />

              <SystemInfo
                icon={
                  <Clock3
                    size={18}
                  />
                }
                label="Access"
                value={
                  user?.role ||
                  'Not assigned'
                }
              />

            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div
            className="
              card
              border
              rounded-4
              h-100
            "
          >
            <div
              className="
                card-header
                bg-white
                border-bottom
                py-3
              "
            >
              <h2 className="h6 fw-bold mb-1">
                Quick Actions
              </h2>

              <p className="small text-secondary mb-0">
                Frequently used reports
              </p>
            </div>

            <div className="card-body">
              <div className="row g-2">

                <div className="col-12 col-md-6">
                  <QuickAction
                    icon={
                      <Clock3
                        size={19}
                      />
                    }
                    title="Hourly Sales"
                    description="View hourly performance"
                    onClick={() =>
                      onNavigate(
                        'hourly-sales',
                      )
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <QuickAction
                    icon={
                      <TrendingUp
                        size={19}
                      />
                    }
                    title="System Sales"
                    description="View sales summary"
                    onClick={() =>
                      onNavigate(
                        'system-sales',
                      )
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <QuickAction
                    icon={
                      <FileText
                        size={19}
                      />
                    }
                    title="POS Journal"
                    description="Review POS transactions"
                    onClick={() =>
                      onNavigate(
                        'pos-journal',
                      )
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <QuickAction
                    icon={
                      <Banknote
                        size={19}
                      />
                    }
                    title="Deposit Monitoring"
                    description="Review deposits"
                    onClick={() =>
                      onNavigate(
                        'deposit',
                      )
                    }
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  )
}

interface KpiCardProps {
  title: string
  value: string
  description: string
  icon: ReactNode
}

function KpiCard({
  title,
  value,
  description,
  icon,
}: KpiCardProps) {
  return (
    <article
      className="
        card
        border
        rounded-4
        h-100
      "
    >
      <div
        className="
          card-body
          d-flex
          align-items-center
          gap-3
        "
      >
        <div className="dashboard-icon-box flex-shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <small
            className="
              text-secondary
              d-block
              mb-1
            "
          >
            {title}
          </small>

          <div
            className="
              fs-4
              fw-bold
              lh-sm
              mb-1
            "
          >
            {value}
          </div>

          <small className="text-secondary">
            {description}
          </small>
        </div>
      </div>
    </article>
  )
}

interface SystemInfoProps {
  icon: ReactNode
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
    <div
      className="
        d-flex
        align-items-center
        gap-3
        px-3
        py-3
        border-bottom
        dashboard-system-row
      "
    >
      <div className="dashboard-icon-box flex-shrink-0">
        {icon}
      </div>

      <div className="flex-grow-1 min-w-0">
        <small
          className="
            text-secondary
            d-block
            mb-1
          "
        >
          {label}
        </small>

        <strong className="d-block text-truncate">
          {value}
        </strong>
      </div>

      {status && (
        <span
          className="
            badge
            text-bg-success
            bg-opacity-10
            text-success
            border
            border-success
            border-opacity-25
          "
        >
          Online
        </span>
      )}
    </div>
  )
}

interface QuickActionProps {
  icon: ReactNode
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
      className="
        btn
        btn-light
        border
        rounded-3
        w-100
        h-100
        d-flex
        align-items-center
        gap-3
        text-start
        p-3
        dashboard-quick-action
      "
      onClick={onClick}
    >
      <span className="dashboard-icon-box flex-shrink-0">
        {icon}
      </span>

      <span className="min-w-0">
        <strong className="d-block mb-1">
          {title}
        </strong>

        <small className="text-secondary">
          {description}
        </small>
      </span>
    </button>
  )
}

export default DashboardPage