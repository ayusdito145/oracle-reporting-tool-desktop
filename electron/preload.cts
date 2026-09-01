import {
  contextBridge,
  ipcRenderer,
} from 'electron'

contextBridge.exposeInMainWorld('api', {
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },

  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password),
  },

  system: {
    healthCheck: () =>
      ipcRenderer.invoke('system:health-check'),

    checkVersion: () =>
      ipcRenderer.invoke('system:check-version'),
  },

rof: {
  loadSource: (businessDate: string) =>
    ipcRenderer.invoke(
      'rof:load-source',
      businessDate,
    ),

  loadDetails: (businessDate: string) =>
    ipcRenderer.invoke(
      'rof:load-details',
      businessDate,
    ),

  loadSummary: (
    dateFrom: string,
    dateTo: string,
    locationName: string,
  ) =>
    ipcRenderer.invoke(
      'rof:load-summary',
      dateFrom,
      dateTo,
      locationName,
    ),

  create: (input: unknown) =>
    ipcRenderer.invoke(
      'rof:create',
      input,
    ),

  delete: (businessDate: string) =>
    ipcRenderer.invoke(
      'rof:delete',
      businessDate,
    ),
},
})

console.log('Electron preload loaded')