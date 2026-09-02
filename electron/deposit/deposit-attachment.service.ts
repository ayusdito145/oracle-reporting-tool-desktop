import {
  dialog,
} from 'electron'

import fs from 'node:fs/promises'
import path from 'node:path'

export interface SelectDepositAttachmentResult {
  canceled: boolean
  filePath: string
  fileName: string
  previewDataUrl: string
}

function mimeFromExtension(
  extension: string,
): string {
  switch (
    extension.toLowerCase()
  ) {
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

export async function selectDepositAttachment():
  Promise<SelectDepositAttachmentResult> {
  const result =
    await dialog.showOpenDialog({
      title:
        'Select Deposit Attachment',

      properties: [
        'openFile',
      ],

      filters: [
        {
          name:
            'Image Files',

          extensions: [
            'jpg',
            'jpeg',
            'png',
            'gif',
            'bmp',
            'tif',
            'tiff',
          ],
        },
      ],
    })

  if (
    result.canceled ||
    result.filePaths.length ===
      0
  ) {
    return {
      canceled: true,
      filePath: '',
      fileName: '',
      previewDataUrl: '',
    }
  }

  const filePath =
    result.filePaths[0]

  const fileName =
    path.basename(
      filePath,
    )

  const extension =
    path.extname(
      filePath,
    )

  const buffer =
    await fs.readFile(
      filePath,
    )

  const previewDataUrl =
    `data:${mimeFromExtension(
      extension,
    )};base64,${buffer.toString(
      'base64',
    )}`

  return {
    canceled: false,
    filePath,
    fileName,
    previewDataUrl,
  }
}
