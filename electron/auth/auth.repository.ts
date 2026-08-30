import sql from 'mssql'

import { getSqlPool } from '../database/sqlserver.js'

export interface DatabaseUser {
  username: string
  access: string
  locationName: string
  locationId: string
}

export async function findUserByCredentials(
  username: string,
  password: string,
): Promise<DatabaseUser | null> {
  const pool = await getSqlPool()

  const result = await pool
    .request()
    .input(
      'username',
      sql.VarChar,
      username,
    )
    .input(
      'password',
      sql.VarChar,
      password,
    )
    .query(`
      SELECT TOP 1
        locationname,
        access,
        username,
        locationid
      FROM dts_location
      WHERE username = @username
        AND password = @password AND IsActive = 1
    `)

  if (result.recordset.length === 0) {
    return null
  }

  const row = result.recordset[0]

  return {
    username:
      String(row.username ?? ''),

    access:
      String(row.access ?? ''),

    locationName:
      String(row.locationname ?? ''),

    locationId:
      String(row.locationid ?? ''),
  }
}