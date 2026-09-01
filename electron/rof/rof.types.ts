export interface RofCashSource {
  cashierName: string
  tenderName: string
  posAmount: number
}

export interface RofNonCashSource {
  tenderName: string
  posAmount: number
}

export interface RofCashEntry {
  cashierName: string
  tenderName: string
  posAmount: number
  actualAmount: number
  mod: string
  remarks: string
}

export interface RofNonCashEntry {
  tenderName: string
  posAmount: number
  actualAmount: number
  remarks: string
}

export interface SaveRofInput {
  businessDate: string
  locationName: string
  cash: RofCashEntry[]
  nonCash: RofNonCashEntry[]
}

export interface SaveRofResult {
  success: boolean
  rofId?: number
  message: string
}

export interface RofDetails {
  exists: boolean
  businessDate: string
  cash: RofCashEntry[]
  nonCash: RofNonCashEntry[]
}

export interface RofStatus {
  exists: boolean
  rofId: number | null
}
export interface DeleteRofResult {
  success: boolean
  message: string
}

export interface RofSummaryRow {
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

export interface RofSummaryResult {
  success: boolean
  rows: RofSummaryRow[]
  message: string
}


