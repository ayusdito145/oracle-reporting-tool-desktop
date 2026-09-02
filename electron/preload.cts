import {
  contextBridge,
  ipcRenderer,
} from 'electron'

import type {
  CreateDepositInput,
  DepositListInput,
  UpdateDepositInput,
} from './deposit/deposit.types.js'




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

getDepositSource: (
  businessDate: string,
) =>
  ipcRenderer.invoke(
    'rof:get-deposit-source',
    businessDate,
  ),
},

deposit: {
  checkStatus: (
    businessDate: string,
    locationName: string,
  ) =>
    ipcRenderer.invoke(
      'deposit:check-status',
      businessDate,
      locationName,
    ),

  create: (
      input: CreateDepositInput,
  ) =>
    ipcRenderer.invoke(
      'deposit:create',
      input,
    ),

  list: (
    input: DepositListInput,
  ) =>
    ipcRenderer.invoke(
      'deposit:list',
      input,
    ),

  getById: (
    depositId: number,
    locationName: string,
  ) =>
    ipcRenderer.invoke(
      'deposit:get-by-id',
      depositId,
      locationName,
    ),

  update: (
    input: UpdateDepositInput,
  ) =>
    ipcRenderer.invoke(
      'deposit:update',
      input,
    ),

  delete: (
    depositId: number,
    locationName: string,
  ) =>
    ipcRenderer.invoke(
      'deposit:delete',
      depositId,
      locationName,
    ),

  selectAttachment: () =>
  ipcRenderer.invoke(
    'deposit:select-attachment',
  ),

  getAttachment: (fileName: string) =>
  ipcRenderer.invoke(
    'deposit:get-attachment',
    fileName,
  ),

downloadAttachment: (fileName: string) =>
  ipcRenderer.invoke(
    'deposit:download-attachment',
    fileName,
  ),

replaceAttachment: (fileName: string) =>
  ipcRenderer.invoke(
    'deposit:replace-attachment',
    fileName,
  ),


},
})

console.log('Electron preload loaded')