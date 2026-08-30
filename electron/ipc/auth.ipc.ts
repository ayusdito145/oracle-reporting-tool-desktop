import { ipcMain } from 'electron'

import { loginUser } from '../auth/auth.service.js'

export function registerAuthIpc() {
  console.log('Registering authentication IPC...')

  ipcMain.handle(
    'auth:login',
    async (
      _event,
      username: string,
      password: string,
    ) => {
      console.log(
        'IPC auth:login received:',
        username,
      )

      return loginUser(
        username,
        password,
      )
    },
  )
}