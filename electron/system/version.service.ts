import { app } from 'electron'

import { getHqDbPool } from '../database/hqdb.js'

export interface VersionCheckResult {
  success: boolean
  currentVersion: string
  latestVersion: string | null
  updateAvailable: boolean
  message: string
}

function normalizeVersion(
  version: string,
): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((part) => {
      const value = Number(part)

      return Number.isNaN(value)
        ? 0
        : value
    })
}

function isNewerVersion(
  latest: string,
  current: string,
): boolean {
  const latestParts =
    normalizeVersion(latest)

  const currentParts =
    normalizeVersion(current)

  const length = Math.max(
    latestParts.length,
    currentParts.length,
  )

  for (let i = 0; i < length; i++) {
    const latestPart =
      latestParts[i] ?? 0

    const currentPart =
      currentParts[i] ?? 0

    if (latestPart > currentPart) {
      return true
    }

    if (latestPart < currentPart) {
      return false
    }
  }

  return false
}

export async function checkAppVersion():
Promise<VersionCheckResult> {
  const currentVersion =
    app.getVersion()

  try {
    const pool = await getHqDbPool()

    const result =
      await pool.request().query(`
        SELECT TOP 1
          LatestVersion
        FROM AppVersionControl_Test
        ORDER BY ID DESC
      `)

    if (result.recordset.length === 0) {
      return {
        success: false,
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        message:
          'No version information found.',
      }
    }

    const latestVersion =
      String(
        result.recordset[0]
          .LatestVersion ?? '',
      ).trim()

    if (!latestVersion) {
      return {
        success: false,
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        message:
          'Latest version is not configured.',
      }
    }

    const updateAvailable =
      isNewerVersion(
        latestVersion,
        currentVersion,
      )

    return {
      success: true,
      currentVersion,
      latestVersion,
      updateAvailable,

      message: updateAvailable
        ? `Version ${latestVersion} is available.`
        : 'Application is up to date.',
    }
  } catch (error) {
    console.error(
      'Version check failed:',
      error,
    )

    return {
      success: false,
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      message:
        'Unable to check application version.',
    }
  }
}