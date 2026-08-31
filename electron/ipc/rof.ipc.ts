import { ipcMain } from 'electron'

import {
  createRof,
  deleteRof,
  loadRofDetails,
  loadRofSource,
} from '../rof/rof.service.js'

import type { SaveRofInput } from '../rof/rof.types.js'

export function registerRofIpc() {
  console.log('Registering ROF IPC...')

  ipcMain.handle(
    'rof:load-source',
    async (_event, businessDate: string) => {
      return loadRofSource(businessDate)
    },
    
  )

  ipcMain.handle(
    'rof:load-details',
    async (_event, businessDate: string) => {
      return loadRofDetails(businessDate)
    },
  )

  ipcMain.handle(
    'rof:create',
    async (_event, input: SaveRofInput) => {
      return createRof(input)
    },
  )
  
  ipcMain.handle(
  'rof:delete',
  async (_event, businessDate: string) => {
    return deleteRof(businessDate)
  },
)

}