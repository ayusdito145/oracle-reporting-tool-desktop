import {
  Bell,
  RefreshCw,
  UserRound,
} from 'lucide-react'

interface TopHeaderProps {
  title: string
  version?: string

  userName?: string
  userRole?: string

  updateStatus?:
    | 'idle'
    | 'checking'
    | 'available'
    | 'downloading'
    | 'ready'
}

function TopHeader({
  title,
  version = 'v1.0.0',
  userName = 'User',
  userRole = 'System User',
  updateStatus = 'idle',
}: TopHeaderProps) {
  function getUpdateLabel() {
    switch (
      updateStatus
    ) {
      case 'checking':
        return 'Checking updates...'

      case 'available':
        return 'Update available'

      case 'downloading':
        return 'Downloading update...'

      case 'ready':
        return 'Restart to update'

      default:
        return ''
    }
  }

  return (
    <header className="bg-white border-bottom px-3 px-lg-4 py-3">

      <div className="d-flex align-items-center justify-content-between gap-3">

        <div>
          <h1 className="h5 fw-bold mb-0">
            {title}
          </h1>

          <small className="text-secondary">
            Oracle Reporting Tool
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">

          {updateStatus !==
            'idle' && (
            <div className="badge text-bg-light border d-flex align-items-center gap-2 px-3 py-2">

              <RefreshCw
                size={14}
                className={
                  updateStatus ===
                    'checking' ||
                  updateStatus ===
                    'downloading'
                    ? 'spin'
                    : ''
                }
              />

              <span>
                {getUpdateLabel()}
              </span>

            </div>
          )}

          <span className="badge text-bg-light border">
            {version}
          </span>

          <button
            type="button"
            className="btn btn-light border d-flex align-items-center justify-content-center header-icon-btn"
            aria-label="Notifications"
          >
            <Bell
              size={18}
            />
          </button>

          <button
            type="button"
            className="btn btn-light border d-flex align-items-center gap-2 px-2 px-lg-3"
          >
            <span className="user-avatar d-flex align-items-center justify-content-center rounded-circle">
              <UserRound
                size={17}
              />
            </span>

            <span className="d-none d-md-flex flex-column text-start lh-sm">

              <span className="fw-semibold small">
                {userName}
              </span>

              <small className="text-secondary">
                {userRole}
              </small>

            </span>

          </button>

        </div>

      </div>

    </header>
  )
}

export default TopHeader