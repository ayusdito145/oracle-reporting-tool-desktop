import {
  deleteDeposit,
  getDepositById,
  getDeposits,
  getDepositStatus,
  saveDeposit,
  updateDeposit,
} from './deposit.repository.js'

import type {
  DeleteDepositResult,
  DepositListInput,
  DepositListResult,
  GetDepositResult,
  SaveDepositInput,
  SaveDepositResult,
  UpdateDepositInput,
  UpdateDepositResult,
} from './deposit.types.js'

function isValidDate(
  value: string,
): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value,
  )
}

function validNumber(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0
  )
}

export async function createDeposit(
  input: SaveDepositInput,
): Promise<SaveDepositResult> {
  try {
    if (
      !input.locationName.trim()
    ) {
      return {
        success: false,
        message:
          'Location is required.',
      }
    }

    if (
      !isValidDate(
        input.businessDate,
      )
    ) {
      return {
        success: false,
        message:
          'Invalid business date.',
      }
    }

    if (
      !isValidDate(
        input.depositDate,
      )
    ) {
      return {
        success: false,
        message:
          'Invalid deposit date.',
      }
    }

    if (
      !input.depositReference.trim()
    ) {
      return {
        success: false,
        message:
          'Deposit Ref# is required.',
      }
    }

    if (
      input.posAmount <= 0
    ) {
      return {
        success: false,
        message:
          'ROF POS amount is required.',
      }
    }

    const numericValues = [
      input.posAmount,
      input.depositAmount,
      input.pettyCash,
      input.bir2307,
      input.openSales,
      input.otherDepartmentExpense,
    ]

    if (
      numericValues.some(
        (value) =>
          !validNumber(value),
      )
    ) {
      return {
        success: false,
        message:
          'Deposit amounts cannot be negative or invalid.',
      }
    }

    if (
      !input.filename.trim()
    ) {
      return {
        success: false,
        message:
          'Deposit attachment is required.',
      }
    }

    const status =
      await getDepositStatus(
        input.businessDate,
        input.locationName,
      )

    if (status.exists) {
      return {
        success: false,
        message:
          'This Business Date is already saved.',
      }
    }

    const depositId =
      await saveDeposit(input)

    return {
      success: true,
      depositId,
      message:
        'Deposit saved successfully.',
    }
  } catch (error) {
    console.error(
      'Create deposit failed:',
      error,
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save deposit.',
    }
  }
}

export async function checkDepositStatus(
  businessDate: string,
  locationName: string,
) {
  return getDepositStatus(
    businessDate,
    locationName,
  )
}

export async function loadDeposits(
  input: DepositListInput,
): Promise<DepositListResult> {
  try {
    if (
      !input.locationName.trim()
    ) {
      return {
        success: false,
        rows: [],
        totalRecords: 0,
        totalPages: 0,
        message:
          'Location is required.',
      }
    }

    const page =
      Math.max(
        1,
        input.page,
      )

    const pageSize =
      Math.max(
        1,
        input.pageSize,
      )

    const result =
      await getDeposits({
        ...input,
        page,
        pageSize,
      })

    return {
      success: true,

      rows:
        result.rows,

      totalRecords:
        result.totalRecords,

      totalPages:
        Math.ceil(
          result.totalRecords /
            pageSize,
        ),

      message:
        'Deposits loaded successfully.',
    }
  } catch (error) {
    console.error(
      'Load deposits failed:',
      error,
    )

    return {
      success: false,
      rows: [],
      totalRecords: 0,
      totalPages: 0,

      message:
        error instanceof Error
          ? error.message
          : 'Unable to load deposits.',
    }
  }
}

export async function loadDepositById(
  depositId: number,
  locationName: string,
): Promise<GetDepositResult> {
  try {
    if (
      !Number.isInteger(
        depositId,
      ) ||
      depositId <= 0
    ) {
      return {
        success: false,
        deposit: null,
        message:
          'Invalid deposit ID.',
      }
    }

    if (
      !locationName.trim()
    ) {
      return {
        success: false,
        deposit: null,
        message:
          'Location is required.',
      }
    }

    const deposit =
      await getDepositById(
        depositId,
        locationName,
      )

    if (!deposit) {
      return {
        success: false,
        deposit: null,
        message:
          'Deposit record was not found.',
      }
    }

    return {
      success: true,
      deposit,
      message:
        'Deposit loaded successfully.',
    }
  } catch (error) {
    console.error(
      'Load deposit failed:',
      error,
    )

    return {
      success: false,
      deposit: null,

      message:
        error instanceof Error
          ? error.message
          : 'Unable to load deposit.',
    }
  }
}

export async function editDeposit(
  input: UpdateDepositInput,
): Promise<UpdateDepositResult> {
  try {
    if (
      !Number.isInteger(
        input.depositId,
      ) ||
      input.depositId <= 0
    ) {
      return {
        success: false,
        message:
          'Invalid deposit ID.',
      }
    }

    if (
      !input.locationName.trim()
    ) {
      return {
        success: false,
        message:
          'Location is required.',
      }
    }

    if (
      !isValidDate(
        input.depositDate,
      )
    ) {
      return {
        success: false,
        message:
          'Invalid deposit date.',
      }
    }

    if (
      !input.depositReference.trim()
    ) {
      return {
        success: false,
        message:
          'Deposit Ref# is required.',
      }
    }

    const values = [
      input.pettyCash,
      input.bir2307,
      input.openSales,
      input.otherDepartmentExpense,
    ]

    if (
      values.some(
        (value) =>
          !validNumber(value),
      )
    ) {
      return {
        success: false,
        message:
          'Amounts cannot be negative or invalid.',
      }
    }

    const existing =
      await getDepositById(
        input.depositId,
        input.locationName,
      )

    if (!existing) {
      return {
        success: false,
        message:
          'Deposit record was not found.',
      }
    }

    const updated =
      await updateDeposit(input)

    if (!updated) {
      return {
        success: false,
        message:
          'No deposit record was updated.',
      }
    }

    return {
      success: true,
      message:
        'Deposit updated successfully.',
    }
  } catch (error) {
    console.error(
      'Update deposit failed:',
      error,
    )

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : 'Unable to update deposit.',
    }
  }
}

export async function removeDeposit(
  depositId: number,
  locationName: string,
): Promise<DeleteDepositResult> {
  try {
    if (
      !Number.isInteger(
        depositId,
      ) ||
      depositId <= 0
    ) {
      return {
        success: false,
        message:
          'Invalid deposit ID.',
      }
    }

    if (
      !locationName.trim()
    ) {
      return {
        success: false,
        message:
          'Location is required.',
      }
    }

    const existing =
      await getDepositById(
        depositId,
        locationName,
      )

    if (!existing) {
      return {
        success: false,
        message:
          'Deposit record was not found.',
      }
    }

    const deleted =
      await deleteDeposit(
        depositId,
        locationName,
      )

    if (!deleted) {
      return {
        success: false,
        message:
          'Deposit record was not deleted.',
      }
    }

    return {
      success: true,
      message:
        'Deposit deleted successfully.',
    }
  } catch (error) {
    console.error(
      'Delete deposit failed:',
      error,
    )

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : 'Unable to delete deposit.',
    }
  }
}