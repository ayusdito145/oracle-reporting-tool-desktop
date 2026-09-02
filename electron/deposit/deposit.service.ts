import {
  deleteDeposit,
  getDepositById,
  getDeposits,
  getDepositStatus,
  saveDeposit,
  updateDeposit,
} from './deposit.repository.js'

import {
  getDepositSource,
} from '../rof/rof.service.js'

import {
  deleteDepositImage,
  uploadDepositImage,
  validateDepositImagePath,
} from '../ftp/ftp.service.js'


import type {
  CreateDepositInput,
  DeleteDepositResult,
  DepositInsert,
  DepositListInput,
  DepositListResult,
  GetDepositResult,
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
  input: CreateDepositInput,
): Promise<SaveDepositResult> {
  let uploadedFileName:
    string | null =
    null

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

    const numericValues = [
      input.pettyCash,
      input.bir2307,
      input.openSales,
      input.otherDepartmentExpense,
    ]

    if (
      numericValues.some(
        (value) =>
          !validNumber(
            value,
          ),
      )
    ) {
      return {
        success: false,
        message:
          'Deposit amounts cannot be negative or invalid.',
      }
    }

    if (
      !input.localFilePath.trim()
    ) {
      return {
        success: false,
        message:
          'Please select a deposit attachment.',
      }
    }

    // Validate the renderer-provided path again in Electron.
    validateDepositImagePath(
      input.localFilePath,
    )

    // Get trusted ROF totals from LocalDB.
    const rofSource =
      await getDepositSource(
        input.businessDate,
      )

    if (!rofSource.exists) {
      return {
        success: false,
        message:
          rofSource.message,
      }
    }

    if (
      !validNumber(
        rofSource.posAmount,
      ) ||
      !validNumber(
        rofSource.actualAmount,
      )
    ) {
      return {
        success: false,
        message:
          'ROF contains invalid cash totals.',
      }
    }

    if (
      rofSource.posAmount <= 0
    ) {
      return {
        success: false,
        message:
          'ROF POS amount is required.',
      }
    }

    // Check duplicate before uploading.
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

    // Upload first.
    // If the DB insert later fails, the catch block removes the upload.
    uploadedFileName =
      await uploadDepositImage(
        input.localFilePath,
      )

    const deposit:
      DepositInsert = {
        locationName:
          input.locationName.trim(),

        businessDate:
          input.businessDate,

        depositDate:
          input.depositDate,

        depositReference:
          input.depositReference.trim(),

        posAmount:
          rofSource.posAmount,

        depositAmount:
          rofSource.actualAmount,

        pettyCash:
          input.pettyCash,

        bir2307:
          input.bir2307,

        openSales:
          input.openSales,

        otherDepartmentExpense:
          input.otherDepartmentExpense,

        filename:
          uploadedFileName,
      }

    const depositId =
      await saveDeposit(
        deposit,
      )

    return {
      success: true,
      depositId,
      message:
        'Deposit image uploaded and record saved successfully.',
    }
  } catch (error) {
    // Compensating cleanup:
    // don't leave an orphan FTP image if HQDB save fails.
    if (
      uploadedFileName
    ) {
      try {
        await deleteDepositImage(
          uploadedFileName,
        )
      } catch (
        cleanupError
      ) {
        console.error(
          'FTP cleanup failed:',
          cleanupError,
        )
      }
    }

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
    let attachmentWarning = ''

if (existing.filename?.trim()) {
  try {
    await deleteDepositImage(existing.filename)
  } catch (error) {
    console.error(
      'Deposit deleted but FTP attachment cleanup failed:',
      error,
    )

    attachmentWarning =
      ' The database record was deleted, but the FTP attachment could not be removed.'
  }
}

return {
  success: true,
  message: `Deposit deleted successfully.${attachmentWarning}`,
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