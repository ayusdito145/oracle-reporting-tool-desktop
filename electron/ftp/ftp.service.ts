import {
  Client,
} from 'basic-ftp'

import path from 'node:path'
import fs from 'node:fs/promises'
import { Writable } from 'node:stream'

const allowedExtensions =
  new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.tiff',
  ])

function getRequiredEnv(
  key: string,
): string {
  const value =
    process.env[key]?.trim()

  if (!value) {
    throw new Error(
      `${key} is not configured.`,
    )
  }

  return value
}

function safeRemoteFileName(fileName: string): string {
  const safeName = path.basename(fileName)

  if (!safeName || safeName === '.' || safeName === '..') {
    throw new Error('Invalid attachment filename.')
  }

  return safeName
}



export function validateDepositImagePath(
  localFilePath: string,
): string {
  const extension =
    path.extname(
      localFilePath,
    ).toLowerCase()

  if (
    !allowedExtensions.has(
      extension,
    )
  ) {
    throw new Error(
      'Only JPG, JPEG, PNG, GIF, BMP, and TIFF files are allowed.',
    )
  }

  return path.basename(
    localFilePath,
  )
}

async function createFtpClient() {
  const client =
    new Client()

  client.ftp.verbose =
    false

  await client.access({
    host:
      getRequiredEnv(
        'FTP_HOST',
      ),

    user:
      getRequiredEnv(
        'FTP_USER',
      ),

    password:
      getRequiredEnv(
        'FTP_PASSWORD',
      ),

    secure:
      process.env
        .FTP_SECURE ===
      'true',
  })

  return client
}

export async function uploadDepositImage(
  localFilePath: string,
): Promise<string> {
  await fs.access(
    localFilePath,
  )

  const fileName =
    validateDepositImagePath(
      localFilePath,
    )

  const remotePath =
    `/${fileName}`

  const client =
    await createFtpClient()

  try {
    const size =
      await client.size(
        remotePath,
      ).catch(
        () => -1,
      )

    if (size >= 0) {
      throw new Error(
        `The file "${fileName}" already exists on the FTP server. Please rename the file or choose a different one.`,
      )
    }

    await client.uploadFrom(
      localFilePath,
      remotePath,
    )

    return fileName
  } finally {
    client.close()
  }
}

export async function deleteDepositImage(
  fileName: string,
): Promise<void> {
  const safeName =
    path.basename(
      fileName,
    )

  const client =
    await createFtpClient()

  try {
    await client.remove(
      `/${safeName}`,
      true,
    )
  } finally {
    client.close()
  }
}

export async function downloadDepositImageBuffer(
  fileName: string,
): Promise<Buffer> {
  const safeName = safeRemoteFileName(fileName)
  const client = await createFtpClient()

  try {
    const chunks: Buffer[] = []

    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk),
        )
        callback()
      },
    })

    await client.downloadTo(destination, `/${safeName}`)

    return Buffer.concat(chunks)
  } finally {
    client.close()
  }
}

export async function downloadDepositImageToFile(
  fileName: string,
  destinationPath: string,
): Promise<void> {
  const safeName = safeRemoteFileName(fileName)
  const client = await createFtpClient()

  try {
    await client.downloadTo(destinationPath, `/${safeName}`)
  } finally {
    client.close()
  }
}

export async function replaceDepositImage(
  localFilePath: string,
  existingFileName: string,
): Promise<void> {
  validateDepositImagePath(localFilePath)
  await fs.access(localFilePath)

  const safeName = safeRemoteFileName(existingFileName)
  const client = await createFtpClient()

  try {
    // Preserve the filename stored in dts_depo.filename.
    // basic-ftp uploadFrom overwrites the existing remote file.
    await client.uploadFrom(localFilePath, `/${safeName}`)
  } finally {
    client.close()
  }
}

