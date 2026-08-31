export {}

interface LoginUser {
  username: string
  displayName: string
  role: string
  locationName: string
  locationId: string
}

interface LoginResult {
  success: boolean
  user?: LoginUser
  message?: string
}

interface SystemHealthResult {
  ready: boolean
  localDbConnected: boolean
  hqDbConnected: boolean
  message: string
}
interface VersionCheckResult {
  success: boolean
  currentVersion: string
  latestVersion: string | null
  updateAvailable: boolean
  message: string
}

declare global {
  interface Window {
    api: {
      app: {
        getVersion: () =>
          Promise<string>
      }

      auth: {
        login: (
          username: string,
          password: string,
        ) => Promise<LoginResult>
      }
        system: {
    healthCheck: () => Promise<SystemHealthResult>
      checkVersion:
    () => Promise<VersionCheckResult>
  }
    }
  }
}