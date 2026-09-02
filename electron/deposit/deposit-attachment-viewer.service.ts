import { dialog } from 'electron'
import path from 'node:path'

import {
  downloadDepositImageBuffer,
  downloadDepositImageToFile,
  replaceDepositImage,
  validateDepositImagePath,
} from '../ftp/ftp.service.js'

export interface DepositAttachmentPreviewResult {
  success: boolean
  fileName: string
  previewDataUrl: string
  message: string
}

export interface DepositAttachmentDownloadResult {
  success: boolean
  canceled: boolean
  savedPath: string
  message: string
}

export interface DepositAttachmentReplaceResult {
  success: boolean
  canceled: boolean
  previewDataUrl: string
  message: string
}

function mimeFromFileName(fileName: string): string {
  switch (path.extname(fileName).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.bmp':
      return 'image/bmp'
    case '.tif':
    case '.tiff':
      return 'image/tiff'
    default:
      return 'application/octet-stream'
  }
}

function toPreviewDataUrl(fileName: string, buffer: Buffer): string {
  return `data:${mimeFromFileName(fileName)};base64,${buffer.toString('base64')}`
}

export async function getDepositAttachmentPreview(
  fileName: string,
): Promise<DepositAttachmentPreviewResult> {
  try {
    if (!fileName.trim()) {
      return {
        success: false,
        fileName: '',
        previewDataUrl: '',
        message: 'This deposit has no attachment filename.',
      }
    }

    const buffer = await downloadDepositImageBuffer(fileName)

    return {
      success: true,
      fileName: path.basename(fileName),
      previewDataUrl: toPreviewDataUrl(fileName, buffer),
      message: 'Attachment loaded successfully.',
    }
  } catch (error) {
    console.error('Load deposit attachment failed:', error)

    return {
      success: false,
      fileName: path.basename(fileName),
      previewDataUrl: '',
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load attachment.',
    }
  }
}

export async function downloadDepositAttachment(
  fileName: string,
): Promise<DepositAttachmentDownloadResult> {
  try {
    if (!fileName.trim()) {
      return {
        success: false,
        canceled: false,
        savedPath: '',
        message: 'This deposit has no attachment filename.',
      }
    }

    const safeName = path.basename(fileName)

    const result = await dialog.showSaveDialog({
      title: 'Download Deposit Attachment',
      defaultPath: safeName,
      filters: [
        {
          name: 'Image Files',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff'],
        },
      ],
    })

    if (result.canceled || !result.filePath) {
      return {
        success: false,
        canceled: true,
        savedPath: '',
        message: 'Download canceled.',
      }
    }

    await downloadDepositImageToFile(safeName, result.filePath)

    return {
      success: true,
      canceled: false,
      savedPath: result.filePath,
      message: 'Attachment downloaded successfully.',
    }
  } catch (error) {
    console.error('Download deposit attachment failed:', error)

    return {
      success: false,
      canceled: false,
      savedPath: '',
      message:
        error instanceof Error
          ? error.message
          : 'Unable to download attachment.',
    }
  }
}

export async function replaceDepositAttachment(
  existingFileName: string,
): Promise<DepositAttachmentReplaceResult> {
  try {
    if (!existingFileName.trim()) {
      return {
        success: false,
        canceled: false,
        previewDataUrl: '',
        message: 'This deposit has no attachment filename.',
      }
    }

    const result = await dialog.showOpenDialog({
      title: 'Replace Deposit Attachment',
      properties: ['openFile'],
      filters: [
        {
          name: 'Image Files',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff'],
        },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return {
        success: false,
        canceled: true,
        previewDataUrl: '',
        message: 'Replace canceled.',
      }
    }

    const localFilePath = result.filePaths[0]

    validateDepositImagePath(localFilePath)
    await replaceDepositImage(localFilePath, existingFileName)

    const buffer = await downloadDepositImageBuffer(existingFileName)

    return {
      success: true,
      canceled: false,
      previewDataUrl: toPreviewDataUrl(existingFileName, buffer),
      message: 'Attachment replaced successfully.',
    }
  } catch (error) {
    console.error('Replace deposit attachment failed:', error)

    return {
      success: false,
      canceled: false,
      previewDataUrl: '',
      message:
        error instanceof Error
          ? error.message
          : 'Unable to replace attachment.',
    }
  }
}
