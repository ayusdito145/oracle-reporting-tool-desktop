import {
  useEffect,
  useState,
} from 'react'

import {
  LockKeyhole,
  UserRound,
} from 'lucide-react'

import logo from '../assets/jco-logo.png'

import {
  useAuth,
} from '../auth/useAuth'

function LoginPage() {
  const {
    login,
  } = useAuth()

  const [
    username,
    setUsername,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    error,
    setError,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    systemReady,
    setSystemReady,
  ] = useState(false)

  const [
    systemStatus,
    setSystemStatus,
  ] =
    useState(
      'Checking system...',
    )

  const [
    checkingSystem,
    setCheckingSystem,
  ] = useState(true)

  useEffect(() => {
    async function runStartupChecks() {
      try {
        setCheckingSystem(
          true,
        )

        setSystemStatus(
          'Connecting to database...',
        )

        const health =
          await window.api.system
            .healthCheck()

        if (!health.ready) {
          setSystemReady(
            false,
          )

          setSystemStatus(
            health.message,
          )

          return
        }

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

        setSystemReady(
          true,
        )
      } catch (error) {
        console.error(
          'Startup check failed:',
          error,
        )

        setSystemReady(
          false,
        )

        setSystemStatus(
          'System startup check failed.',
        )
      } finally {
        setCheckingSystem(
          false,
        )
      }
    }

    runStartupChecks()
  }, [])

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
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
      await login(
        username,
        password,
      )

    if (success) {
      return
    }

    setLoading(false)

    setError(
      'Invalid username or password.',
    )
  }

  const statusClass =
    systemReady
      ? 'text-success'
      : checkingSystem
        ? 'text-secondary'
        : 'text-danger'

  return (
    <div
      className="
        min-vh-100
        d-flex
        align-items-center
        justify-content-center
        p-3
        p-md-4
        login-page-bootstrap
      "
    >
      <div
        className="
          bg-white
          rounded-4
          shadow-sm
          border
          overflow-hidden
          w-100
        "
        style={{
          maxWidth: '440px',
        }}
      >
        {/* Brand */}

        <div
          className="
            border-bottom
            px-4
            py-4
            d-flex
            align-items-center
            gap-3
          "
        >
          <img
            src={logo}
            alt="Oracle Reporting Tool"
            className="login-logo-bootstrap"
          />

          <div>
            <h1 className="h5 fw-bold mb-1">
              Oracle Reporting Tool
            </h1>

            <p className="small text-secondary mb-0">
              Contemporain Foods Inc.
            </p>
          </div>
        </div>

        {/* Content */}

        <div className="p-4">

          <div className="mb-4">

            <div
              className="
                text-uppercase
                fw-bold
                small
                mb-2
                brand-text
              "
            >
              Welcome Back
            </div>

            <h2 className="h4 fw-bold mb-2">
              Sign in to continue
            </h2>

            <p className="text-secondary small mb-0">
              Access reports,
              transactions, finance
              modules, and system tools.
            </p>

          </div>

          <form
            onSubmit={
              handleSubmit
            }
          >
            {/* Username */}

            <div className="mb-3">

              <label
                htmlFor="username"
                className="form-label fw-semibold"
              >
                Username
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <UserRound
                    size={18}
                  />
                </span>

                <input
                  id="username"
                  type="text"
                  className="form-control"
                  value={
                    username
                  }
                  onChange={(
                    event,
                  ) =>
                    setUsername(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={
                    loading
                  }
                />

              </div>

            </div>

            {/* Password */}

            <div className="mb-3">

              <label
                htmlFor="password"
                className="form-label fw-semibold"
              >
                Password
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <LockKeyhole
                    size={18}
                  />
                </span>

                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={
                    password
                  }
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={
                    loading
                  }
                />

              </div>

            </div>

            {/* Login error */}

            {error && (
              <div
                className="
                  alert
                  alert-danger
                  py-2
                  small
                  mb-3
                "
                role="alert"
              >
                {error}
              </div>
            )}

            {/* System status */}

            <div
              className="
                bg-light
                border
                rounded-3
                px-3
                py-2
                mb-3
                d-flex
                align-items-center
                gap-2
                small
              "
            >
              {checkingSystem ? (
                <span
                  className="
                    spinner-border
                    spinner-border-sm
                    text-secondary
                  "
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className={`
                    login-status-dot
                    ${
                      systemReady
                        ? 'bg-success'
                        : 'bg-danger'
                    }
                  `}
                />
              )}

              <span
                className={
                  statusClass
                }
              >
                {systemStatus}
              </span>

            </div>

            {/* Submit */}

            <button
              type="submit"
              className="
                btn
                btn-primary
                w-100
                py-2
                fw-semibold
              "
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

        </div>

        {/* Footer */}

        <div
          className="
            border-top
            bg-light
            px-4
            py-3
            text-center
            small
            text-secondary
          "
        >
          Oracle Reporting Tool
          <span className="mx-2">
            •
          </span>
          Secure Desktop Access
        </div>

      </div>
    </div>
  )
}

export default LoginPage