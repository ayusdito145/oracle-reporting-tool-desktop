import sql from 'mssql'

import {
  getHqDbPool,
} from '../database/hqdb.js'

import type {
  DepositListInput,
  DepositRecord,
  DepositStatus,
  SaveDepositInput,
  UpdateDepositInput,
} from './deposit.types.js'

function formatSqlDate(
  value: Date | string | null,
): string {
  if (!value) {
    return ''
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value)

  return date
    .toISOString()
    .slice(0, 10)
}



export async function getDepositStatus(
  businessDate: string,
  locationName: string,
): Promise<DepositStatus> {
  const pool =
    await getHqDbPool()

  const result =
    await pool
      .request()
      .input(
        'businessDate',
        sql.Date,
        businessDate,
      )
      .input(
        'locationName',
        sql.VarChar,
        locationName,
      )
      .query(`
        SELECT TOP 1
          depo_id AS depositId
        FROM dbo.dts_depo
        WHERE busidate = @businessDate
          AND locationname = @locationName
      `)

  const row =
    result.recordset[0]

  if (!row) {
    return {
      exists: false,
      depositId: null,
    }
  }

  return {
    exists: true,
    depositId:
      Number(row.depositId),
  }
}

export async function saveDeposit(
  input: SaveDepositInput,
): Promise<number> {
  const pool =
    await getHqDbPool()

  const transaction =
    new sql.Transaction(pool)

  await transaction.begin()

  try {
    const request =
      new sql.Request(transaction)

    const result =
      await request
        .input(
          'locationName',
          sql.VarChar,
          input.locationName,
        )
        .input(
          'businessDate',
          sql.Date,
          input.businessDate,
        )
        .input(
          'depositDate',
          sql.Date,
          input.depositDate,
        )
        .input(
          'depositReference',
          sql.VarChar,
          input.depositReference,
        )
        .input(
          'posAmount',
          sql.Decimal(18, 2),
          input.posAmount,
        )
        .input(
          'depositAmount',
          sql.Decimal(18, 2),
          input.depositAmount,
        )
        .input(
          'pettyCash',
          sql.Decimal(18, 2),
          input.pettyCash,
        )
        .input(
          'bir2307',
          sql.Decimal(18, 2),
          input.bir2307,
        )
        .input(
          'openSales',
          sql.Decimal(18, 2),
          input.openSales,
        )
        .input(
          'otherDepartmentExpense',
          sql.Decimal(18, 2),
          input.otherDepartmentExpense,
        )
        .input(
          'filename',
          sql.VarChar,
          input.filename,
        )
        .query(`
          INSERT INTO dbo.dts_depo
          (
            locationname,
            busidate,
            pos,
            datedepo,
            deporef,
            deposit,
            pettycash,
            bir2307,
            opensales,
            otherdeptexp,
            filename
          )
          OUTPUT INSERTED.depo_id
          VALUES
          (
            @locationName,
            @businessDate,
            @posAmount,
            @depositDate,
            @depositReference,
            @depositAmount,
            @pettyCash,
            @bir2307,
            @openSales,
            @otherDepartmentExpense,
            @filename
          )
        `)

    const depositId =
      Number(
        result.recordset[0]
          ?.depo_id,
      )

    await transaction.commit()

    return depositId
  } catch (error) {
    await transaction.rollback()

    throw error
  }
}
export async function getDeposits(
  input: DepositListInput,
): Promise<{
  rows: DepositRecord[]
  totalRecords: number
}> {
  const pool =
    await getHqDbPool()

  const page =
    Math.max(1, input.page)

  const pageSize =
    Math.max(1, input.pageSize)

  const offset =
    (page - 1) * pageSize

  const keyword =
    input.keyword?.trim() ?? ''

  const request =
    pool
      .request()
      .input(
        'locationName',
        sql.VarChar,
        input.locationName,
      )
      .input(
        'keyword',
        sql.VarChar,
        `%${keyword}%`,
      )
      .input(
        'pageSize',
        sql.Int,
        pageSize,
      )
      .input(
        'offset',
        sql.Int,
        offset,
      )

  if (input.month) {
    request.input(
      'month',
      sql.Int,
      input.month,
    )
  }

  if (input.year) {
    request.input(
      'year',
      sql.Int,
      input.year,
    )
  }

  const filters: string[] = [
    'locationname = @locationName',
  ]

  if (keyword) {
    filters.push(`
      (
        CAST(depo_id AS VARCHAR(50))
          LIKE @keyword

        OR ISNULL(deporef, '')
          LIKE @keyword

        OR ISNULL(filename, '')
          LIKE @keyword

        OR CAST(
          ISNULL(deposit, 0)
          AS VARCHAR(50)
        ) LIKE @keyword
      )
    `)
  }

  if (input.month) {
    filters.push(`
      MONTH(busidate) = @month
    `)
  }

  if (input.year) {
    filters.push(`
      YEAR(busidate) = @year
    `)
  }

  const whereClause =
    filters.join(' AND ')

  const countResult =
    await request.query(`
      SELECT
        COUNT(*) AS totalRecords
      FROM dbo.dts_depo
      WHERE ${whereClause}
    `)

  const totalRecords =
    Number(
      countResult.recordset[0]
        ?.totalRecords ?? 0,
    )

  const dataRequest =
    pool
      .request()
      .input(
        'locationName',
        sql.VarChar,
        input.locationName,
      )
      .input(
        'keyword',
        sql.VarChar,
        `%${keyword}%`,
      )
      .input(
        'pageSize',
        sql.Int,
        pageSize,
      )
      .input(
        'offset',
        sql.Int,
        offset,
      )

  if (input.month) {
    dataRequest.input(
      'month',
      sql.Int,
      input.month,
    )
  }

  if (input.year) {
    dataRequest.input(
      'year',
      sql.Int,
      input.year,
    )
  }

  const result =
    await dataRequest.query(`
      SELECT
        depo_id,
        locationname,
        busidate,
        datedepo,
        deporef,
        ISNULL(pos, 0)
          AS pos,
        ISNULL(deposit, 0)
          AS deposit,
        ISNULL(pettycash, 0)
          AS pettycash,
        ISNULL(bir2307, 0)
          AS bir2307,
        ISNULL(opensales, 0)
          AS opensales,
        ISNULL(otherdeptexp, 0)
          AS otherdeptexp,
        ISNULL(filename, '')
          AS filename

      FROM dbo.dts_depo

      WHERE ${whereClause}

      ORDER BY
        busidate DESC,
        depo_id DESC

      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `)

  const rows: DepositRecord[] =
    result.recordset.map(
      (row) => {
        const posAmount =
          Number(row.pos ?? 0)

        const depositAmount =
          Number(
            row.deposit ?? 0,
          )

        const pettyCash =
          Number(
            row.pettycash ?? 0,
          )

        const bir2307 =
          Number(
            row.bir2307 ?? 0,
          )

        const openSales =
          Number(
            row.opensales ?? 0,
          )

        const otherDepartmentExpense =
          Number(
            row.otherdeptexp ?? 0,
          )

        const variance =
          depositAmount +
          pettyCash +
          bir2307 +
          openSales +
          otherDepartmentExpense -
          posAmount

        return {
          depositId:
            Number(row.depo_id),

          locationName:
            String(
              row.locationname ?? '',
            ),

          businessDate:
            formatSqlDate(
              row.busidate,
            ),

          depositDate:
            formatSqlDate(
              row.datedepo,
            ),

          depositReference:
            String(
              row.deporef ?? '',
            ),

          posAmount,
          depositAmount,
          pettyCash,
          bir2307,
          openSales,
          otherDepartmentExpense,
          variance,

          filename:
            String(
              row.filename ?? '',
            ),
        }
      },
    )

  return {
    rows,
    totalRecords,
  }
}

export async function getDepositById(
  depositId: number,
  locationName: string,
): Promise<DepositRecord | null> {
  const pool =
    await getHqDbPool()

  const result =
    await pool
      .request()
      .input(
        'depositId',
        sql.Int,
        depositId,
      )
      .input(
        'locationName',
        sql.VarChar,
        locationName,
      )
      .query(`
        SELECT TOP 1
          depo_id,
          locationname,
          busidate,
          datedepo,
          deporef,

          ISNULL(pos, 0)
            AS pos,

          ISNULL(deposit, 0)
            AS deposit,

          ISNULL(pettycash, 0)
            AS pettycash,

          ISNULL(bir2307, 0)
            AS bir2307,

          ISNULL(opensales, 0)
            AS opensales,

          ISNULL(otherdeptexp, 0)
            AS otherdeptexp,

          ISNULL(filename, '')
            AS filename

        FROM dbo.dts_depo

        WHERE depo_id = @depositId
          AND locationname = @locationName
      `)

  const row =
    result.recordset[0]

  if (!row) {
    return null
  }

  const posAmount =
    Number(row.pos ?? 0)

  const depositAmount =
    Number(row.deposit ?? 0)

  const pettyCash =
    Number(row.pettycash ?? 0)

  const bir2307 =
    Number(row.bir2307 ?? 0)

  const openSales =
    Number(row.opensales ?? 0)

  const otherDepartmentExpense =
    Number(
      row.otherdeptexp ?? 0,
    )

  const variance =
    depositAmount +
    pettyCash +
    bir2307 +
    openSales +
    otherDepartmentExpense -
    posAmount

  return {
    depositId:
      Number(row.depo_id),

    locationName:
      String(
        row.locationname ?? '',
      ),

    businessDate:
      formatSqlDate(
        row.busidate,
      ),

    depositDate:
      formatSqlDate(
        row.datedepo,
      ),

    depositReference:
      String(
        row.deporef ?? '',
      ),

    posAmount,
    depositAmount,
    pettyCash,
    bir2307,
    openSales,
    otherDepartmentExpense,
    variance,

    filename:
      String(
        row.filename ?? '',
      ),
  }
}

export async function updateDeposit(
  input: UpdateDepositInput,
): Promise<boolean> {
  const pool =
    await getHqDbPool()

  const result =
    await pool
      .request()
      .input(
        'depositId',
        sql.Int,
        input.depositId,
      )
      .input(
        'locationName',
        sql.VarChar,
        input.locationName,
      )
      .input(
        'depositDate',
        sql.Date,
        input.depositDate,
      )
      .input(
        'depositReference',
        sql.VarChar,
        input.depositReference,
      )
      .input(
        'pettyCash',
        sql.Decimal(18, 2),
        input.pettyCash,
      )
      .input(
        'bir2307',
        sql.Decimal(18, 2),
        input.bir2307,
      )
      .input(
        'openSales',
        sql.Decimal(18, 2),
        input.openSales,
      )
      .input(
        'otherDepartmentExpense',
        sql.Decimal(18, 2),
        input.otherDepartmentExpense,
      )
      .query(`
        UPDATE dbo.dts_depo

        SET
          datedepo =
            @depositDate,

          deporef =
            @depositReference,

          pettycash =
            @pettyCash,

          bir2307 =
            @bir2307,

          opensales =
            @openSales,

          otherdeptexp =
            @otherDepartmentExpense

        WHERE depo_id =
          @depositId

          AND locationname =
            @locationName
      `)

  return (
    result.rowsAffected[0] > 0
  )
}

export async function deleteDeposit(
  depositId: number,
  locationName: string,
): Promise<boolean> {
  const pool =
    await getHqDbPool()

  const transaction =
    new sql.Transaction(pool)

  await transaction.begin()

  try {
    const result =
      await new sql.Request(
        transaction,
      )
        .input(
          'depositId',
          sql.Int,
          depositId,
        )
        .input(
          'locationName',
          sql.VarChar,
          locationName,
        )
        .query(`
          DELETE FROM dbo.dts_depo

          WHERE depo_id =
            @depositId

            AND locationname =
              @locationName
        `)

    await transaction.commit()

    return (
      result.rowsAffected[0] > 0
    )
  } catch (error) {
    await transaction.rollback()

    throw error
  }
}