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
  CreateDepositInput,
  DepositListInput,
  UpdateDepositInput,
} from '../deposit/deposit.types.js'

import {
  selectDepositAttachment,
} from '../deposit/deposit-attachment.service.js'

import {
  downloadDepositAttachment,
  getDepositAttachmentPreview,
  replaceDepositAttachment,
} from '../deposit/deposit-attachment-viewer.service.js'


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
      input: CreateDepositInput,
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

ipcMain.handle(
  'deposit:select-attachment',
  async () => {
    return selectDepositAttachment()
  },
)

ipcMain.handle(
  'deposit:get-attachment',
  async (_event, fileName: string) => {
    return getDepositAttachmentPreview(fileName)
  },
)

ipcMain.handle(
  'deposit:download-attachment',
  async (_event, fileName: string) => {
    return downloadDepositAttachment(fileName)
  },
)

ipcMain.handle(
  'deposit:replace-attachment',
  async (_event, fileName: string) => {
    return replaceDepositAttachment(fileName)
  },
)



  console.log(
    'Deposit IPC registered.',
  )
}