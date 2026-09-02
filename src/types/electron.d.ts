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

interface RofSummaryRow {
  businessDate: string
  locationName: string
  netSalesVat: number
  vat: number
  netSales: number
  gcSales: number
  cash: number
  nonCash: number
  variance: number
  cashRemarks: string
  nonCashRemarks: string
}

interface RofSummaryResult {
  success: boolean
  rows: RofSummaryRow[]
  message: string
}

interface RofDepositSource {
  exists: boolean
  businessDate: string
  rofId: number | null
  posAmount: number
  actualAmount: number
  message: string
}

interface SaveDepositInput {
  locationName: string
  businessDate: string
  depositDate: string
  depositReference: string

  posAmount: number
  depositAmount: number
  pettyCash: number
  bir2307: number
  openSales: number
  otherDepartmentExpense: number

  filename: string
}

interface SaveDepositResult {
  success: boolean
  depositId?: number
  message: string
}

interface DepositStatus {
  exists: boolean
  depositId: number | null
}
interface DepositRecord {
  depositId: number
  locationName: string
  businessDate: string
  depositDate: string
  depositReference: string

  posAmount: number
  depositAmount: number
  pettyCash: number
  bir2307: number
  openSales: number
  otherDepartmentExpense: number

  variance: number
  filename: string
}

interface DepositListInput {
  locationName: string
  page: number
  pageSize: number
  keyword?: string
  month?: number
  year?: number
}

interface DepositListResult {
  success: boolean
  rows: DepositRecord[]
  totalRecords: number
  totalPages: number
  message: string
}

interface UpdateDepositInput {
  depositId: number
  locationName: string

  depositDate: string
  depositReference: string

  pettyCash: number
  bir2307: number
  openSales: number
  otherDepartmentExpense: number
}

interface UpdateDepositResult {
  success: boolean
  message: string
}

interface DeleteDepositResult {
  success: boolean
  message: string
}

interface GetDepositResult {
  success: boolean
  deposit: DepositRecord | null
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
  loadSummary: (
  dateFrom: string,
  dateTo: string,
  locationName: string,
) => Promise<RofSummaryResult>

rof: {
  loadSource: (
    businessDate: string,
  ) => Promise<RofSourceResult>

  loadDetails: (
    businessDate: string,
  ) => Promise<RofDetails>

  loadSummary: (
    dateFrom: string,
    dateTo: string,
    locationName: string,
  ) => Promise<RofSummaryResult>

  create: (
    input: SaveRofInput,
  ) => Promise<SaveRofResult>

  delete: (
    businessDate: string,
  ) => Promise<DeleteRofResult>

getDepositSource: (
  businessDate: string,
) => Promise<RofDepositSource>

}
deposit: {
  checkStatus: (
    businessDate: string,
    locationName: string,
  ) => Promise<DepositStatus>

  create: (
    input: SaveDepositInput,
  ) => Promise<SaveDepositResult>

list: (
  input: DepositListInput,
) => Promise<DepositListResult>

getById: (
  depositId: number,
  locationName: string,
) => Promise<GetDepositResult>

update: (
  input: UpdateDepositInput,
) => Promise<UpdateDepositResult>

delete: (
  depositId: number,
  locationName: string,
) => Promise<DeleteDepositResult>


}

    }
  }
}