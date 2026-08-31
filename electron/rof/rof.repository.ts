import sql from 'mssql'
import { getLocalDbPool } from '../database/localdb.js'

import type {
  RofCashEntry,
  RofCashSource,
  RofNonCashEntry,
  RofNonCashSource,
  RofStatus,
  SaveRofInput,
} from './rof.types.js'

export async function getCashSource(
  businessDate: string,
): Promise<RofCashSource[]> {
  const pool = await getLocalDbPool()

  const result = await pool
    .request()
    .input('businessDate', sql.Date, businessDate)
    .query(`
      SELECT
        emp_name,
        Itemname,
        SUM(amt) AS posreading
      FROM dbo.v_salesdetails
      WHERE transtype = 'Tender'
        AND itemname = 'Cash'
        AND businessdate = @businessDate
      GROUP BY emp_name, Itemname
      HAVING SUM(amt) <> 0
      ORDER BY emp_name
    `)

  return result.recordset.map((row) => ({
    cashierName: String(row.emp_name ?? ''),
    tenderName: String(row.Itemname ?? ''),
    posAmount: Number(row.posreading ?? 0),
  }))
}

export async function getNonCashSource(
  businessDate: string,
): Promise<RofNonCashSource[]> {
  const pool = await getLocalDbPool()

  const result = await pool
    .request()
    .input('businessDate', sql.Date, businessDate)
    .query(`
      SELECT
        Itemname,
        SUM(amt) AS posreading
      FROM dbo.v_salesdetails
      WHERE transtype = 'Tender'
        AND itemname <> 'Cash'
        AND businessdate = @businessDate
      GROUP BY Itemname
      HAVING SUM(amt) <> 0
      ORDER BY Itemname
    `)

  return result.recordset.map((row) => ({
    tenderName: String(row.Itemname ?? ''),
    posAmount: Number(row.posreading ?? 0),
  }))
}

export async function getRofStatus(
  businessDate: string,
): Promise<RofStatus> {
  const pool = await getLocalDbPool()

  const result = await pool
    .request()
    .input('businessDate', sql.Date, businessDate)
    .query(`
      SELECT TOP 1
        rof_id
      FROM dbo.dts_rof_header
      WHERE busidate = @businessDate
    `)

  if (result.recordset.length === 0) {
    return {
      exists: false,
      rofId: null,
    }
  }

  return {
    exists: true,
    rofId: Number(result.recordset[0].rof_id),
  }
}

export async function getSavedCash(
  businessDate: string,
): Promise<RofCashEntry[]> {
  const pool = await getLocalDbPool()

  const result = await pool
    .request()
    .input('businessDate', sql.Date, businessDate)
    .query(`
      SELECT
        cashiername,
        tendername,
        posamt,
        actualamt,
        mod,
        remarks
      FROM dbo.dts_rof_cash
      WHERE busidate = @businessDate
      ORDER BY cashiername
    `)

  return result.recordset.map((row) => ({
    cashierName: String(row.cashiername ?? ''),
    tenderName: String(row.tendername ?? ''),
    posAmount: Number(row.posamt ?? 0),
    actualAmount: Number(row.actualamt ?? 0),
    mod: String(row.mod ?? ''),
    remarks: String(row.remarks ?? ''),
  }))
}

export async function getSavedNonCash(
  businessDate: string,
): Promise<RofNonCashEntry[]> {
  const pool = await getLocalDbPool()

  const result = await pool
    .request()
    .input('businessDate', sql.Date, businessDate)
    .query(`
      SELECT
        tendername,
        tenderamt,
        actualtender,
        remarks
      FROM dbo.dts_rof_noncash
      WHERE busidate = @businessDate
      ORDER BY tendername
    `)

  return result.recordset.map((row) => ({
    tenderName: String(row.tendername ?? ''),
    posAmount: Number(row.tenderamt ?? 0),
    actualAmount: Number(row.actualtender ?? 0),
    remarks: String(row.remarks ?? ''),
  }))
}

export async function saveRof(
  input: SaveRofInput,
): Promise<number> {
  const pool = await getLocalDbPool()

  const transaction = new sql.Transaction(pool)

  await transaction.begin()

  try {
    const duplicateCheck = await new sql.Request(transaction)
      .input('businessDate', sql.Date, input.businessDate)
      .query(`
        SELECT TOP 1 rof_id
        FROM dbo.dts_rof_header
        WHERE busidate = @businessDate
      `)

    if (duplicateCheck.recordset.length > 0) {
      throw new Error(
        'ROF already exists for this business date.',
      )
    }

    const headerResult = await new sql.Request(transaction)
      .input('businessDate', sql.Date, input.businessDate)
      .input('locationName', sql.VarChar, input.locationName)
      .query(`
        INSERT INTO dbo.dts_rof_header
          (busidate, locationname)
        VALUES
          (@businessDate, @locationName);

        SELECT CAST(SCOPE_IDENTITY() AS INT) AS rofId;
      `)

    const rofId = Number(headerResult.recordset[0].rofId)

    for (const row of input.cash) {
      await new sql.Request(transaction)
        .input('rofId', sql.Int, rofId)
        .input('cashierName', sql.VarChar, row.cashierName)
        .input('tenderName', sql.VarChar, row.tenderName)
        .input('posAmount', sql.Decimal(18, 2), row.posAmount)
        .input(
          'actualAmount',
          sql.Decimal(18, 2),
          row.actualAmount,
        )
        .input('mod', sql.VarChar, row.mod)
        .input('remarks', sql.VarChar, row.remarks)
        .input('businessDate', sql.Date, input.businessDate)
        .input('locationName', sql.VarChar, input.locationName)
        .query(`
          INSERT INTO dbo.dts_rof_cash
          (
            rof_id,
            cashiername,
            tendername,
            posamt,
            actualamt,
            mod,
            remarks,
            busidate,
            locationname
          )
          VALUES
          (
            @rofId,
            @cashierName,
            @tenderName,
            @posAmount,
            @actualAmount,
            @mod,
            @remarks,
            @businessDate,
            @locationName
          )
        `)
    }

    for (const row of input.nonCash) {
      await new sql.Request(transaction)
        .input('rofId', sql.Int, rofId)
        .input('tenderName', sql.VarChar, row.tenderName)
        .input('posAmount', sql.Decimal(18, 2), row.posAmount)
        .input(
          'actualAmount',
          sql.Decimal(18, 2),
          row.actualAmount,
        )
        .input('remarks', sql.VarChar, row.remarks)
        .input('businessDate', sql.Date, input.businessDate)
        .input('locationName', sql.VarChar, input.locationName)
        .query(`
          INSERT INTO dbo.dts_rof_noncash
          (
            rof_id,
            tendername,
            tenderamt,
            actualtender,
            remarks,
            busidate,
            locationname
          )
          VALUES
          (
            @rofId,
            @tenderName,
            @posAmount,
            @actualAmount,
            @remarks,
            @businessDate,
            @locationName
          )
        `)
    }

    await transaction.commit()

    return rofId
  } catch (error) {
    try {
      await transaction.rollback()
    } catch {
      // Ignore rollback failure and preserve original error.
    }

    throw error
  }
}
export async function deleteRofByBusinessDate(
  businessDate: string,
): Promise<void> {
  const pool = await getLocalDbPool()

  const transaction = new sql.Transaction(pool)

  await transaction.begin()

  try {
    await new sql.Request(transaction)
      .input('businessDate', sql.Date, businessDate)
      .query(`
        DELETE d
        FROM dbo.dts_rof_cash AS d
        INNER JOIN dbo.dts_rof_header AS h
          ON d.rof_id = h.rof_id
        WHERE h.busidate = @businessDate
      `)

    await new sql.Request(transaction)
      .input('businessDate', sql.Date, businessDate)
      .query(`
        DELETE d
        FROM dbo.dts_rof_noncash AS d
        INNER JOIN dbo.dts_rof_header AS h
          ON d.rof_id = h.rof_id
        WHERE h.busidate = @businessDate
      `)

    await new sql.Request(transaction)
      .input('businessDate', sql.Date, businessDate)
      .query(`
        DELETE FROM dbo.dts_rof_header
        WHERE busidate = @businessDate
      `)

    await transaction.commit()
  } catch (error) {
    try {
      await transaction.rollback()
    } catch {
      // Preserve original error.
    }

    throw error
  }
}