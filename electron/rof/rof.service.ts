import {
deleteRofByBusinessDate,
  getCashSource,
  getNonCashSource,
  getRofStatus,
  getSavedCash,
  getSavedNonCash,
  saveRof,
} from './rof.repository.js'

import type {
DeleteRofResult,
  RofDetails,
  SaveRofInput,
  SaveRofResult,
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