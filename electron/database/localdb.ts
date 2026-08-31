import sql from 'mssql'
import 'dotenv/config'

let pool: sql.ConnectionPool | null = null
let connecting: Promise<sql.ConnectionPool> | null = null

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}

function createConfig(): sql.config {
  return {
    server: requireEnv('LOCAL_DB_SERVER'),
    database: requireEnv('LOCAL_DB_DATABASE'),
    user: requireEnv('LOCAL_DB_USER'),
    password: requireEnv('LOCAL_DB_PASSWORD'),

    port: Number(process.env.LOCAL_DB_PORT ?? 1433),

    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate:
        process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },

    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },

    connectionTimeout: 10000,
    requestTimeout: 30000,
  }
}

export async function getLocalDbPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) {
    return pool
  }

  if (connecting) {
    return connecting
  }

  if (pool) {
    try {
      await pool.close()
    } catch {
      // Ignore errors when cleaning up an old pool.
    }

    pool = null
  }

  const nextPool = new sql.ConnectionPool(createConfig())

  connecting = nextPool
    .connect()
    .then((connectedPool) => {
      console.log('LocalDB connection established.')
      pool = connectedPool

      return connectedPool
    })
    .finally(() => {
      connecting = null
    })

  return connecting
}