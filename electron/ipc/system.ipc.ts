import { ipcMain } from 'electron'

import {
  checkSystemHealth,
} from '../system/system.service.js'

import {
  checkAppVersion,
} from '../system/version.service.js'

export function registerSystemIpc() {
  console.log(
    'Registering system IPC...',
  )

  ipcMain.handle(
    'system:health-check',
    async () => {
      console.log(
        'System health check requested',
      )

      return checkSystemHealth()
    },
  )

  ipcMain.handle(
    'system:check-version',
    async () => {
      console.log(
        'Application version check requested',
      )

      return checkAppVersion()
    },
  )
}