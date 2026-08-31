import { getLocalDbPool } from '../database/localdb.js'
import { getHqDbPool } from '../database/hqdb.js'

export interface SystemHealthResult {
  ready: boolean
  localDbConnected: boolean
  hqDbConnected: boolean
  message: string
}

async function checkLocalDb(): Promise<boolean> {
  try {
    const pool = await getLocalDbPool()

    await pool.request().query(`
      SELECT 1 AS healthcheck
    `)

    return true
  } catch (error) {
    console.error('LocalDB health check failed:', error)

    return false
  }
}

async function checkHqDb(): Promise<boolean> {
  try {
    const pool = await getHqDbPool()

    await pool.request().query(`
      SELECT 1 AS healthcheck
    `)

    return true
  } catch (error) {
    console.error('HQDB health check failed:', error)

    return false
  }
}

export async function checkSystemHealth(): Promise<SystemHealthResult> {
  const [localDbConnected, hqDbConnected] = await Promise.all([
    checkLocalDb(),
    checkHqDb(),
  ])

  if (localDbConnected && hqDbConnected) {
    return {
      ready: true,
      localDbConnected,
      hqDbConnected,
      message: 'System Ready',
    }
  }

  if (!localDbConnected && hqDbConnected) {
    return {
      ready: false,
      localDbConnected,
      hqDbConnected,
      message: 'Unable to connect to the Local POS database.',
    }
  }

  if (localDbConnected && !hqDbConnected) {
    return {
      ready: false,
      localDbConnected,
      hqDbConnected,
      message: 'Unable to connect to the HQ database.',
    }
  }

  return {
    ready: false,
    localDbConnected,
    hqDbConnected,
    message: 'Unable to connect to Local POS and HQ databases.',
  }
}