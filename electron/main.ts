import { app, BrowserWindow,ipcMain} from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerAuthIpc } from './ipc/auth.ipc.js'
import {registerSystemIpc} from './ipc/system.ipc.js'
import { registerRofIpc } from './ipc/rof.ipc.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
 mainWindow = new BrowserWindow({
  width: 1440,
  height: 900,

  minWidth: 1024,
  minHeight: 700,

  webPreferences: {
    preload: path.join(
      __dirname,
      'preload.cjs',
    ),

    contextIsolation: true,
    nodeIntegration: false,
  },
})

  mainWindow.loadURL('http://localhost:5173')
}
ipcMain.handle('app:get-version', () => {
  return app.getVersion()
})

registerAuthIpc()
registerSystemIpc()
registerRofIpc()

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})