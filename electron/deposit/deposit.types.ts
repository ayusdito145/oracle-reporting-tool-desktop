export interface SaveDepositInput {
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

export interface SaveDepositResult {
  success: boolean
  depositId?: number
  message: string
}

export interface DepositStatus {
  exists: boolean
  depositId: number | null
}

export interface DepositRecord {
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

export interface DepositListInput {
  locationName: string
  page: number
  pageSize: number
  keyword?: string
  month?: number
  year?: number
}

export interface DepositListResult {
  success: boolean
  rows: DepositRecord[]
  totalRecords: number
  totalPages: number
  message: string
}

export interface UpdateDepositInput {
  depositId: number
  locationName: string

  depositDate: string
  depositReference: string

  pettyCash: number
  bir2307: number
  openSales: number
  otherDepartmentExpense: number
}

export interface UpdateDepositResult {
  success: boolean
  message: string
}

export interface DeleteDepositResult {
  success: boolean
  message: string
}

export interface GetDepositResult {
  success: boolean
  deposit: DepositRecord | null
  message: string
}