import {
  contextBridge,
  ipcRenderer,
} from 'electron'

contextBridge.exposeInMainWorld(
  'api',
  {
    app: {
      getVersion: () =>
        ipcRenderer.invoke(
          'app:get-version',
        ),
    },

    auth: {
      login: (
        username: string,
        password: string,
      ) =>
        ipcRenderer.invoke(
          'auth:login',
          username,
          password,
        ),
    },

    system: {
      healthCheck: () =>
        ipcRenderer.invoke(
          'system:health-check',
        ),

      checkVersion: () =>
    ipcRenderer.invoke(
      'system:check-version',
    ),
    },
  },
)

console.log('Electron preload loaded')