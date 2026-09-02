import {
  ipcMain,
} from 'electron'

import {
  checkDepositStatus,
  createDeposit,
  editDeposit,
  loadDepositById,
  loadDeposits,
  removeDeposit,
} from '../deposit/deposit.service.js'

import type {
  DepositListInput,
  SaveDepositInput,
  UpdateDepositInput,
} from '../deposit/deposit.types.js'

export function registerDepositIpc() {
  ipcMain.handle(
    'deposit:check-status',
    async (
      _event,
      businessDate: string,
      locationName: string,
    ) => {
      return checkDepositStatus(
        businessDate,
        locationName,
      )
    },
  )

  ipcMain.handle(
    'deposit:create',
    async (
      _event,
      input: SaveDepositInput,
    ) => {
      return createDeposit(
        input,
      )
    },
  )

  ipcMain.handle(
  'deposit:list',
  async (
    _event,
    input: DepositListInput,
  ) => {
    return loadDeposits(input)
  },
)

ipcMain.handle(
  'deposit:get-by-id',
  async (
    _event,
    depositId: number,
    locationName: string,
  ) => {
    return loadDepositById(
      depositId,
      locationName,
    )
  },
)

ipcMain.handle(
  'deposit:update',
  async (
    _event,
    input: UpdateDepositInput,
  ) => {
    return editDeposit(input)
  },
)

ipcMain.handle(
  'deposit:delete',
  async (
    _event,
    depositId: number,
    locationName: string,
  ) => {
    return removeDeposit(
      depositId,
      locationName,
    )
  },
)

  console.log(
    'Deposit IPC registered.',
  )
}