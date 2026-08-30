import sql from 'mssql'
import 'dotenv/config'

const server = process.env.DB_SERVER
const database = process.env.DB_DATABASE
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD

if (
  !server ||
  !database ||
  !user ||
  !password
) {
  throw new Error(
    'SQL Server configuration is incomplete. Check your .env file.',
  )
}

const config: sql.config = {
  server,
  database,
  user,
  password,

  port: Number(
    process.env.DB_PORT ?? 1433,
  ),

  options: {
    encrypt:
      process.env.DB_ENCRYPT === 'true',

    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE !==
      'false',
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 10000,
  requestTimeout: 15000,
}

let pool: sql.ConnectionPool | null = null

export async function getSqlPool() {
  if (pool?.connected) {
    return pool
  }

  if (pool) {
    try {
      await pool.close()
    } catch {
      // Ignore stale pool close errors.
    }
  }

  pool = await sql.connect(config)

  console.log(
    'SQL Server connection established.',
  )

  return pool
}