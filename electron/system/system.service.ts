import {
  getSqlPool,
} from '../database/sqlserver.js'

export interface SystemHealthResult {
  ready: boolean
  databaseConnected: boolean
  message: string
}

export async function checkSystemHealth():
Promise<SystemHealthResult> {
  try {
    const pool = await getSqlPool()

    await pool
      .request()
      .query('SELECT 1 AS healthcheck')

    return {
      ready: true,
      databaseConnected: true,
      message: 'System Ready',
    }
  } catch (error) {
    console.error(
      'System health check failed:',
      error,
    )

    return {
      ready: false,
      databaseConnected: false,
      message:
        'Unable to connect to the database server.',
    }
  }
}