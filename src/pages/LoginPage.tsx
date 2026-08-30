import { useEffect, useState } from 'react'
import {LockKeyhole,UserRound} from 'lucide-react'


import logo from '../assets/jco-logo.png'

import { useAuth } from '../auth/useAuth'


function LoginPage() {
    const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
const [systemReady, setSystemReady] = useState(false)
const [systemStatus, setSystemStatus] = useState('Checking system...')
const [checkingSystem, setCheckingSystem] = useState(true)

useEffect(() => {
  async function runStartupChecks() {
    try {
      setCheckingSystem(true)

      // -------------------------
      // 1. DATABASE
      // -------------------------

      setSystemStatus(
        'Connecting to database...',
      )

      const health =
        await window.api.system
          .healthCheck()

      if (!health.ready) {
        setSystemReady(false)
        setSystemStatus(
          health.message,
        )

        return
      }

      // -------------------------
      // 2. VERSION
      // -------------------------

      setSystemStatus(
        'Checking application version...',
      )

      const version =
        await window.api.system
          .checkVersion()

      console.log(
        'Version check:',
        version,
      )

      if (
        version.success &&
        version.updateAvailable
      ) {
        setSystemStatus(
          `Update available: v${version.latestVersion}`,
        )
      } else {
        setSystemStatus(
          'System Ready',
        )
      }

      // Update does NOT block login
      // during Phase 1.

      setSystemReady(true)
    } catch (error) {
      console.error(
        'Startup check failed:',
        error,
      )

      setSystemReady(false)

      setSystemStatus(
        'System startup check failed.',
      )
    } finally {
      setCheckingSystem(false)
    }
  }

  runStartupChecks()
}, [])

 async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault()

  setError('')

  if (
    !username.trim() ||
    !password.trim()
  ) {
    setError(
      'Please enter your username and password.',
    )

    return
  }

  setLoading(true)

  const success =
    await login(username, password)

  if (success) {
    return
  }

  setLoading(false)

  setError(
    'Invalid username or password.',
  )
}
  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <img
            src={logo}
            alt="Oracle Reporting Tool"
            className="login-logo"
          />

          <div>
            <h1>Oracle Reporting Tool</h1>
            <p>Contemporain Foods Inc.</p>
          </div>
        </div>

        <div className="login-content">
          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>

            <h2>Sign in to continue</h2>

            <p>
              Access reports, transactions, finance modules,
              and system tools.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <div className="input-with-icon">
                <UserRound size={18} />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-with-icon">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
            <div
  className={`system-status ${
    systemReady
      ? 'system-status-ready'
      : checkingSystem
        ? 'system-status-checking'
        : 'system-status-error'
  }`}
>
  <span className="system-status-dot" />

  <span>
    {systemStatus}
  </span>
</div>

         <button
             type="submit"
            className="login-button"
  disabled={
    loading ||
    checkingSystem ||
    !systemReady
  }
>
  {checkingSystem
    ? 'Checking system...'
    : loading
      ? 'Signing in...'
      : 'Sign In'}
</button>
          </form>

          <div className="login-footer">
            <span>Oracle Reporting Tool</span>
            <span>•</span>
            <span>Secure Desktop Access</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage