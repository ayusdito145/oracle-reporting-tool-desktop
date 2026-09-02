import {
  deleteRofByBusinessDate,
  getCashSource,
  getNonCashSource,
  getRofStatus,
  getRofSummary,
  getSavedCash,
  getSavedNonCash,
  saveRof,
  getRofCashTotals,
} from './rof.repository.js'

import type {
  DeleteRofResult,
  RofDetails,
  RofSummaryResult,
  SaveRofInput,
  SaveRofResult,
  RofDepositSource,
} from './rof.types.js'

function isValidDate(value: string): boolean {
  if (!value) return false

  const date = new Date(`${value}T00:00:00`)

  return !Number.isNaN(date.getTime())
}

export async function loadRofSource(businessDate: string) {
  if (!isValidDate(businessDate)) {
    throw new Error('Invalid business date.')
  }

  const [cash, nonCash, status] = await Promise.all([
    getCashSource(businessDate),
    getNonCashSource(businessDate),
    getRofStatus(businessDate),
  ])

  return {
    businessDate,
    exists: status.exists,
    rofId: status.rofId,
    cash,
    nonCash,
  }
}

export async function loadRofDetails(
  businessDate: string,
): Promise<RofDetails> {
  if (!isValidDate(businessDate)) {
    throw new Error('Invalid business date.')
  }

  const status = await getRofStatus(businessDate)

  if (!status.exists) {
    return {
      exists: false,
      businessDate,
      cash: [],
      nonCash: [],
    }
  }

  const [cash, nonCash] = await Promise.all([
    getSavedCash(businessDate),
    getSavedNonCash(businessDate),
  ])

  return {
    exists: true,
    businessDate,
    cash,
    nonCash,
  }
}

export async function createRof(
  input: SaveRofInput,
): Promise<SaveRofResult> {
  try {
    if (!isValidDate(input.businessDate)) {
      return {
        success: false,
        message: 'Invalid business date.',
      }
    }

    if (!input.locationName.trim()) {
      return {
        success: false,
        message: 'Location is required.',
      }
    }

    if (input.cash.length === 0 && input.nonCash.length === 0) {
      return {
        success: false,
        message: 'No ROF data to save.',
      }
    }

    for (const row of input.cash) {
      if (
        !Number.isFinite(row.actualAmount) ||
        row.actualAmount < 0
      ) {
        return {
          success: false,
          message: `Invalid actual amount for ${row.cashierName}.`,
        }
      }

      if (!row.mod.trim()) {
        return {
          success: false,
          message: `MOD is required for ${row.cashierName}.`,
        }
      }
    }

    for (const row of input.nonCash) {
      if (
        !Number.isFinite(row.actualAmount) ||
        row.actualAmount < 0
      ) {
        return {
          success: false,
          message: `Invalid actual amount for ${row.tenderName}.`,
        }
      }
    }

    const status = await getRofStatus(input.businessDate)

    if (status.exists) {
      return {
        success: false,
        message: 'ROF already exists for this business date.',
      }
    }

    const rofId = await saveRof(input)

    return {
      success: true,
      rofId,
      message: 'ROF saved successfully.',
    }
  } catch (error) {
    console.error('Create ROF failed:', error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save ROF.',
    }
  }
}

export async function deleteRof(
  businessDate: string,
): Promise<DeleteRofResult> {
  try {
    if (!isValidDate(businessDate)) {
      return {
        success: false,
        message: 'Invalid business date.',
      }
    }

    const status = await getRofStatus(
      businessDate,
    )

    if (!status.exists) {
      return {
        success: false,
        message:
          'No ROF exists for this business date.',
      }
    }

    await deleteRofByBusinessDate(
      businessDate,
    )

    return {
      success: true,
      message: 'ROF deleted successfully.',
    }
  } catch (error) {
    console.error(
      'Delete ROF failed:',
      error,
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to delete ROF.',
    }
  }
}

async function loadRofSummaryInternal(
  dateFrom: string,
  dateTo: string,
  locationName: string,
): Promise<RofSummaryResult> {
  try {
    if (
      !isValidDate(dateFrom) ||
      !isValidDate(dateTo)
    ) {
      return {
        success: false,
        rows: [],
        message: 'Invalid date range.',
      }
    }

    if (dateTo < dateFrom) {
      return {
        success: false,
        rows: [],
        message:
          'Date To cannot be earlier than Date From.',
      }
    }

    if (!locationName.trim()) {
      return {
        success: false,
        rows: [],
        message: 'Location is required.',
      }
    }

    const rows = await getRofSummary(
      dateFrom,
      dateTo,
      locationName,
    )

    return {
      success: true,
      rows,
      message:
        rows.length === 0
          ? 'No summary records found for the selected date range.'
          : `Summary loaded. ${rows.length} day(s) found.`,
    }
  } catch (error) {
    console.error(
      'Load ROF summary failed:',
      error,
    )

    return {
      success: false,
      rows: [],
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load ROF summary.',
    }
  }
}

export {
  loadRofSummaryInternal as loadRofSummary,
}

export async function getDepositSource(
  businessDate: string,
): Promise<RofDepositSource> {
  try {
    const status =
      await getRofStatus(
        businessDate,
      )

    if (!status.exists) {
      return {
        exists: false,
        businessDate,
        rofId: null,
        posAmount: 0,
        actualAmount: 0,
        message:
          'No ROF exists for this business date. Please create the ROF before entering a deposit.',
      }
    }

    const totals =
      await getRofCashTotals(
        businessDate,
      )

    return {
      exists: true,
      businessDate,
      rofId:
        status.rofId,
      posAmount:
        totals.posAmount,
      actualAmount:
        totals.actualAmount,
      message:
        'ROF loaded successfully.',
    }
  } catch (error) {
    console.error(
      'Load deposit source failed:',
      error,
    )

    return {
      exists: false,
      businessDate,
      rofId: null,
      posAmount: 0,
      actualAmount: 0,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load ROF deposit source.',
    }
  }
}