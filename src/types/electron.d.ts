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
interface RofCashSource {
  cashierName: string
  tenderName: string
  posAmount: number
}

interface RofNonCashSource {
  tenderName: string
  posAmount: number
}

interface RofCashEntry {
  cashierName: string
  tenderName: string
  posAmount: number
  actualAmount: number
  mod: string
  remarks: string
}

interface RofNonCashEntry {
  tenderName: string
  posAmount: number
  actualAmount: number
  remarks: string
}

interface SaveRofInput {
  businessDate: string
  locationName: string
  cash: RofCashEntry[]
  nonCash: RofNonCashEntry[]
}

interface SaveRofResult {
  success: boolean
  rofId?: number
  message: string
}

interface RofSourceResult {
  businessDate: string
  exists: boolean
  rofId: number | null
  cash: RofCashSource[]
  nonCash: RofNonCashSource[]
}

interface RofDetails {
  exists: boolean
  businessDate: string
  cash: RofCashEntry[]
  nonCash: RofNonCashEntry[]
}
interface DeleteRofResult {
  success: boolean
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

rof: {
  loadSource: (
    businessDate: string,
  ) => Promise<RofSourceResult>

  loadDetails: (
    businessDate: string,
  ) => Promise<RofDetails>

  create: (
    input: SaveRofInput,
  ) => Promise<SaveRofResult>
  
delete: (
  businessDate: string,
) => Promise<DeleteRofResult>

}

    }
  }
}