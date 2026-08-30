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
    switch (updateStatus) {
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
    <header className="top-header">
      <div className="top-header-left">
        <div>
          <h1 className="page-title">{title}</h1>

          <div className="page-subtitle">
            Oracle Reporting Tool
          </div>
        </div>
      </div>

      <div className="top-header-right">

        {updateStatus !== 'idle' && (
          <div className={`update-status update-${updateStatus}`}>
            <RefreshCw
              size={15}
              className={
                updateStatus === 'checking' ||
                updateStatus === 'downloading'
                  ? 'spin'
                  : ''
              }
            />

            <span>{getUpdateLabel()}</span>
          </div>
        )}

        <div className="app-version">
          {version}
        </div>

        <button className="header-icon-button">
          <Bell size={18} />
        </button>

        <button className="user-button">
          <div className="user-avatar">
            <UserRound size={17} />
          </div>

          <div className="user-info">
           <span className="user-name">
  {userName}
</span>

<span className="user-role">
  {userRole}
</span>
          </div>
        </button>

      </div>
    </header>
  )
}

export default TopHeader