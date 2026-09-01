import { useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'

import { useAuth } from '../auth/useAuth'
import ConfirmDialog from '../components/common/ConfirmDialog'

import './RofPage.css'

interface CashRow {
  cashierName: string
  tenderName: string
  posAmount: number
  actualAmount: number
  mod: string
  remarks: string
}

interface NonCashRow {
  tenderName: string
  posAmount: number
  actualAmount: number
  remarks: string
}

interface SummaryRow {
  businessDate: string
  locationName: string
  netSalesVat: number
  vat: number
  netSales: number
  gcSales: number
  cash: number
  nonCash: number
  variance: number
  cashRemarks: string
  nonCashRemarks: string
}

type RofView = 'summary' | 'details'

function formatMoney(value: number) {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function todayString() {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    now.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatBusinessDate(
  value: string,
) {
  if (!value) {
    return ''
  }

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(
    'en-PH',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  )
}

function RofPage() {
  const { user } = useAuth()

  // =========================================================
  // VIEW
  // =========================================================

  const [activeView, setActiveView] =
    useState<RofView>('summary')

  // =========================================================
  // SUMMARY ROF STATE
  // =========================================================

  const [dateFrom, setDateFrom] =
    useState(todayString())

  const [dateTo, setDateTo] =
    useState(todayString())

  const [
    summaryRows,
    setSummaryRows,
  ] = useState<SummaryRow[]>([])

  const [
    summaryLoading,
    setSummaryLoading,
  ] = useState(false)

  const [
    summaryMessage,
    setSummaryMessage,
  ] = useState(
    'Select a date range and generate the ROF summary.',
  )

 
  // =========================================================
  // DETAILS ROF STATE
  // =========================================================

  const [
    businessDate,
    setBusinessDate,
  ] = useState(todayString())

  const [cashRows, setCashRows] =
    useState<CashRow[]>([])

  const [
    nonCashRows,
    setNonCashRows,
  ] = useState<NonCashRow[]>([])

  const [loading, setLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [rofExists, setRofExists] =
    useState(false)

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false)

  const [
  showSaveConfirm,
  setShowSaveConfirm,
] = useState(false)

  const [message, setMessage] =
    useState(
      'Select a business date and load POS data.',
    )
    const [
  showValidation,
  setShowValidation,
] = useState(false)


function isCashModMissing(
  row: CashRow,
) {
  return (
    showValidation &&
    !rofExists &&
    row.mod.trim() === ''
  )
}

function requestSaveRof() {
  setShowValidation(true)

  const missingMod =
    cashRows.some(
      (row) =>
        row.mod.trim() === '',
    )

  if (missingMod) {
    setMessage(
      'Please complete all required MOD fields before saving.',
    )

    return
  }

  setShowSaveConfirm(true)
}




  // =========================================================
  // BUSY OVERLAY
  // =========================================================

  const isBusy =
    loading ||
    saving ||
    deleting ||
    summaryLoading

  const busyMessage = deleting
    ? 'Deleting ROF...'
    : saving
      ? 'Saving ROF...'
      : summaryLoading
        ? 'Generating ROF Summary...'
        : 'Loading ROF data...'

  // =========================================================
  // DETAILS TOTALS
  // =========================================================

  const cashTotals = useMemo(() => {
    return cashRows.reduce(
      (result, row) => {
        result.pos +=
          row.posAmount

        result.actual +=
          row.actualAmount

        return result
      },
      {
        pos: 0,
        actual: 0,
      },
    )
  }, [cashRows])

  const nonCashTotals =
    useMemo(() => {
      return nonCashRows.reduce(
        (result, row) => {
          result.pos +=
            row.posAmount

          result.actual +=
            row.actualAmount

          return result
        },
        {
          pos: 0,
          actual: 0,
        },
      )
    }, [nonCashRows])

  const cashVariance =
    cashTotals.actual -
    cashTotals.pos

  const nonCashVariance =
    nonCashTotals.actual -
    nonCashTotals.pos

  // =========================================================
  // SUMMARY TOTALS
  // =========================================================

  const summaryTotals =
    useMemo(() => {
      return summaryRows.reduce(
        (total, row) => {
          total.netSalesVat +=
            row.netSalesVat

          total.vat += row.vat

          total.netSales +=
            row.netSales

          total.gcSales +=
            row.gcSales

          total.cash += row.cash

          total.nonCash +=
            row.nonCash

          total.variance +=
            row.variance

          return total
        },
        {
          netSalesVat: 0,
          vat: 0,
          netSales: 0,
          gcSales: 0,
          cash: 0,
          nonCash: 0,
          variance: 0,
        },
      )
    }, [summaryRows])

  // =========================================================
  // LOAD SUMMARY
  // =========================================================

  async function loadSummary() {
    if (!user) {
      setSummaryMessage(
        'Unable to determine logged-in location.',
      )

      return
    }

    if (!dateFrom || !dateTo) {
      setSummaryMessage(
        'Date From and Date To are required.',
      )

      return
    }

    if (dateTo < dateFrom) {
      setSummaryMessage(
        'Date To cannot be earlier than Date From.',
      )

      return
    }

    try {
      setSummaryLoading(true)

      setSummaryMessage(
        'Generating ROF summary...',
      )

      const result =
        await window.api.rof.loadSummary(
          dateFrom,
          dateTo,
          user.locationName,
        )

      if (!result.success) {
        setSummaryRows([])

        setSummaryMessage(
          result.message,
        )

        return
      }

      setSummaryRows(
        result.rows,
      )

      setSummaryMessage(
        result.message,
      )
    } catch (error) {
      console.error(
        'Unable to load ROF summary:',
        error,
      )

      setSummaryRows([])

      setSummaryMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load ROF summary.',
      )
    } finally {
      setSummaryLoading(false)
    }
  }

  // =========================================================
  // LOAD DETAILS / POS DATA
  // =========================================================

  async function loadData() {
    try {
        setShowValidation(false)
       setLoading(true)

      setLoading(true)

      setMessage(
        `Loading ROF data for ${businessDate}...`,
      )

      const source =
        await window.api.rof.loadSource(
          businessDate,
        )

      setRofExists(
        source.exists,
      )

      if (source.exists) {
        const details =
          await window.api.rof.loadDetails(
            businessDate,
          )

        setCashRows(
          details.cash,
        )

        setNonCashRows(
          details.nonCash,
        )

        setMessage(
          'ROF already exists for this business date.',
        )

        return
      }

      setCashRows(
        source.cash.map(
          (row) => ({
            cashierName:
              row.cashierName,

            tenderName:
              row.tenderName,

            posAmount:
              row.posAmount,

            actualAmount: 0,

            mod: '',

            remarks: '',
          }),
        ),
      )

      setNonCashRows(
        source.nonCash.map(
          (row) => ({
            tenderName:
              row.tenderName,

            posAmount:
              row.posAmount,

            actualAmount: 0,

            remarks: '',
          }),
        ),
      )

      if (
        source.cash.length ===
          0 &&
        source.nonCash.length ===
          0
      ) {
        setMessage(
          'No POS tender data found for this business date.',
        )
      } else {
        setMessage(
          'POS data loaded. Enter actual amounts then save the ROF.',
        )
      }
    } catch (error) {
      console.error(
        'Unable to load ROF:',
        error,
      )

      setCashRows([])
      setNonCashRows([])
      setRofExists(false)

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load ROF data.',
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // DELETE ROF
  // =========================================================

  async function deleteRof() {
    if (!rofExists) {
      setMessage(
        'No ROF exists for this business date.',
      )

      return
    }

    try {
      setShowDeleteConfirm(
        false,
      )

      setDeleting(true)

      setMessage(
        'Deleting ROF...',
      )

      const result =
        await window.api.rof.delete(
          businessDate,
        )

      setMessage(
        result.message,
      )

      if (!result.success) {
        return
      }

      setCashRows([])
      setNonCashRows([])
      setRofExists(false)

      setMessage(
        'ROF deleted successfully. You may load POS data again.',
      )
    } catch (error) {
      console.error(
        'Unable to delete ROF:',
        error,
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete ROF.',
      )
    } finally {
      setDeleting(false)
    }
  }

  // =========================================================
  // CASH INPUT
  // =========================================================

  function updateCashActual(
    index: number,
    value: string,
  ) {
    const amount =
      Number(value)

    setCashRows(
      (current) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,

                  actualAmount:
                    Number.isFinite(
                      amount,
                    )
                      ? amount
                      : 0,
                }
              : row,
        ),
    )
  }

  function updateCashText(
    index: number,
    field:
      | 'mod'
      | 'remarks',
    value: string,
  ) {
    setCashRows(
      (current) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,

                  [field]:
                    value,
                }
              : row,
        ),
    )
  }

  // =========================================================
  // NON-CASH INPUT
  // =========================================================

  function updateNonCashActual(
    index: number,
    value: string,
  ) {
    const amount =
      Number(value)

    setNonCashRows(
      (current) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,

                  actualAmount:
                    Number.isFinite(
                      amount,
                    )
                      ? amount
                      : 0,
                }
              : row,
        ),
    )
  }

  function updateNonCashRemarks(
    index: number,
    value: string,
  ) {
    setNonCashRows(
      (current) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,

                  remarks:
                    value,
                }
              : row,
        ),
    )
  }

  // =========================================================
  // SAVE ROF
  // =========================================================

  async function saveRof() {
     setShowSaveConfirm(false)
    if (!user) {
      setMessage(
        'Unable to determine logged-in location.',
      )

      return
    }

    if (rofExists) {
      setMessage(
        'ROF already exists for this business date.',
      )

      return
    }

    try {
      setSaving(true)

      setMessage(
        'Saving ROF...',
      )

      const result =
        await window.api.rof.create(
          {
            businessDate,

            locationName:
              user.locationName,

            cash:
              cashRows,

            nonCash:
              nonCashRows,
          },
        )

      setMessage(
        result.message,
      )

      if (
        result.success
      ) {
        setRofExists(true)
        setShowValidation(false)
      }
    } catch (error) {
      console.error(
        'Unable to save ROF:',
        error,
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save ROF.',
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="rof-page">
      {isBusy && (
        <div className="rof-busy-overlay">
          <div className="rof-busy-content">
            <div className="rof-progress-circle" />

            <div className="rof-busy-title">
              {busyMessage}
            </div>

            <div className="rof-busy-subtitle">
              Please wait while the
              transaction is being
              processed.
            </div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}

      <div className="rof-page-header">
        <div>
          <h1>
            Remittance of Fund
          </h1>

          <p>
            Cash and non-cash
            remittance monitoring per
            business date.
          </p>
        </div>

        <div className="rof-location">
          {user?.locationName ??
            'Unknown location'}
        </div>
      </div>

      {/* VIEW TABS */}

      <div className="rof-view-tabs">
        <button
          type="button"
          className={
            activeView ===
            'summary'
              ? 'rof-view-tab active'
              : 'rof-view-tab'
          }
          disabled={isBusy}
          onClick={() =>
            setActiveView(
              'summary',
            )
          }
        >
          <BarChart3
            size={16}
          />

          Summary ROF
        </button>

        <button
          type="button"
          className={
            activeView ===
            'details'
              ? 'rof-view-tab active'
              : 'rof-view-tab'
          }
          disabled={isBusy}
          onClick={() =>
            setActiveView(
              'details',
            )
          }
        >
          <CalendarDays
            size={16}
          />

          Details ROF
        </button>
      </div>

      {/* =====================================================
          SUMMARY VIEW
      ====================================================== */}

      {activeView ===
      'summary' ? (
        <>
          <section className="rof-filter-card">
            <div className="rof-date-field">
              <label htmlFor="rof-date-from">
                <CalendarDays
                  size={17}
                />

                Date From
              </label>

              <input
                id="rof-date-from"
                type="date"
                value={
                  dateFrom
                }
                max={todayString()}
                disabled={
                  summaryLoading
                }
                onChange={(
                  event,
                ) => {
                  setDateFrom(
                    event
                      .target
                      .value,
                  )

                  setSummaryRows(
                    [],
                  )

                  setSummaryMessage(
                    'Click Generate to load the selected date range.',
                  )
                }}
              />
            </div>

            <div className="rof-date-field">
              <label htmlFor="rof-date-to">
                <CalendarDays
                  size={17}
                />

                Date To
              </label>

              <input
                id="rof-date-to"
                type="date"
                value={
                  dateTo
                }
                max={todayString()}
                disabled={
                  summaryLoading
                }
                onChange={(
                  event,
                ) => {
                  setDateTo(
                    event
                      .target
                      .value,
                  )

                  setSummaryRows(
                    [],
                  )

                  setSummaryMessage(
                    'Click Generate to load the selected date range.',
                  )
                }}
              />
            </div>

            <button
              type="button"
              className="rof-load-button"
              disabled={
                summaryLoading ||
                !dateFrom ||
                !dateTo
              }
              onClick={
                loadSummary
              }
            >
              <RefreshCw
                size={17}
              />

              {summaryLoading
                ? 'Generating...'
                : 'Generate'}
            </button>
          </section>

          <div className="rof-status">
            {summaryMessage}
          </div>

          <section className="rof-section">
            <div className="rof-section-header">
              <div>
                <h2>
                  ROF Summary
                </h2>

                <p>
                  Consolidated
                  remittance summary
                  per business date.
                </p>
              </div>

              <div className="rof-summary-count">
                {
                  summaryRows.length
                }{' '}
                day
                {summaryRows.length ===
                1
                  ? ''
                  : 's'}
              </div>
            </div>

            <div className="rof-table-wrapper">
              <table className="rof-table rof-summary-table">
                <thead>
                  <tr>
                    <th>
                      Business Date
                    </th>

                    <th className="numeric">
                      Net Sales w/
                      VAT
                    </th>

                    <th className="numeric">
                      VAT
                    </th>

                    <th className="numeric">
                      Net Sales
                    </th>

                    <th className="numeric">
                      GC / Srvc
                      Charge
                    </th>

                    <th className="numeric">
                      Cash
                      Remitted
                    </th>

                    <th className="numeric">
                      Non-Cash
                      Remitted
                    </th>

                    <th className="numeric">
                      Variance
                    </th>

                    <th>
                      Cash Remarks
                    </th>

                    <th>
                      Non-Cash
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {summaryRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          10
                        }
                        className="rof-empty"
                      >
                        No summary
                        records
                        loaded.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {summaryRows.map(
                        (
                          row,
                        ) => (
                          <tr
                            key={
                              row.businessDate
                            }
                          >
                            <td>
                              {formatBusinessDate(
                                row.businessDate,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.netSalesVat,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.vat,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.netSales,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.gcSales,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.cash,
                              )}
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.nonCash,
                              )}
                            </td>

                            <td
                              className={`numeric ${
                                row.variance ===
                                0
                                  ? ''
                                  : row.variance >
                                      0
                                    ? 'positive'
                                    : 'negative'
                              }`}
                            >
                              ₱
                              {formatMoney(
                                row.variance,
                              )}
                            </td>

                            <td className="rof-remarks-cell">
                              {row.cashRemarks ||
                                '—'}
                            </td>

                            <td className="rof-remarks-cell">
                              {row.nonCashRemarks ||
                                '—'}
                            </td>
                          </tr>
                        ),
                      )}

                      <tr className="rof-total-row">
                        <td>
                          TOTAL
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.netSalesVat,
                          )}
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.vat,
                          )}
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.netSales,
                          )}
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.gcSales,
                          )}
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.cash,
                          )}
                        </td>

                        <td className="numeric">
                          ₱
                          {formatMoney(
                            summaryTotals.nonCash,
                          )}
                        </td>

                        <td
                          className={`numeric ${
                            summaryTotals.variance ===
                            0
                              ? ''
                              : summaryTotals.variance >
                                  0
                                ? 'positive'
                                : 'negative'
                          }`}
                        >
                          ₱
                          {formatMoney(
                            summaryTotals.variance,
                          )}
                        </td>

                        <td />
                        <td />
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* =================================================
              DETAILS VIEW
          ================================================== */}

          <section className="rof-filter-card">
            <div className="rof-date-field">
              <label htmlFor="rof-business-date">
                <CalendarDays
                  size={17}
                />

                Business Date
              </label>

              <input
                id="rof-business-date"
                type="date"
                value={
                  businessDate
                }
                max={todayString()}
                disabled={
                  isBusy
                }
               onChange={(event) => {
  setBusinessDate(
    event.target.value,
  )

  setCashRows([])
  setNonCashRows([])
  setRofExists(false)
  setShowValidation(false)

  setMessage(
    'Click Load POS Data to continue.',
  )
}}
              />
            </div>

            <button
              type="button"
              className="rof-load-button"
              disabled={
                isBusy ||
                !businessDate
              }
              onClick={
                loadData
              }
            >
              <RefreshCw
                size={17}
              />

              {loading
                ? 'Loading...'
                : 'Load POS Data'}
            </button>
          </section>

          <div
            className={
              rofExists
                ? 'rof-status rof-status-warning'
                : 'rof-status'
            }
          >
            {message}
          </div>

          {/* CASH */}

          <section className="rof-section">
            <div className="rof-section-header">
              <div>
                <h2>
                  Cash Remittance
                </h2>

                <p>
                  Cash tender
                  grouped by
                  cashier.
                </p>
              </div>

              <div className="rof-summary">
                POS{' '}

                <strong>
                  ₱
                  {formatMoney(
                    cashTotals.pos,
                  )}
                </strong>

                <span />

                Actual{' '}

                <strong>
                  ₱
                  {formatMoney(
                    cashTotals.actual,
                  )}
                </strong>

                <span />

                Variance{' '}

                <strong
                  className={
                    cashVariance ===
                    0
                      ? ''
                      : cashVariance >
                          0
                        ? 'positive'
                        : 'negative'
                  }
                >
                  ₱
                  {formatMoney(
                    cashVariance,
                  )}
                </strong>
              </div>
            </div>

            <div className="rof-table-wrapper">
              <table className="rof-table">
                <thead>
                  <tr>
                    <th>
                      Cashier
                    </th>

                    <th>
                      Tender
                    </th>

                    <th className="numeric">
                      POS Amount
                    </th>

                    <th className="amount-input-column">
                      Actual
                      Amount
                    </th>

                    <th className="numeric">
                      Variance
                    </th>

                    <th>
                      MOD
                    </th>

                    <th>
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cashRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          7
                        }
                        className="rof-empty"
                      >
                        No cash data
                        loaded.
                      </td>
                    </tr>
                  ) : (
                    cashRows.map(
                      (
                        row,
                        index,
                      ) => {
                        const variance =
                          row.actualAmount -
                          row.posAmount

                        return (
                          <tr
                            key={`${row.cashierName}-${index}`}
                          >
                            <td>
                              {
                                row.cashierName
                              }
                            </td>

                            <td>
                              {
                                row.tenderName
                              }
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.posAmount,
                              )}
                            </td>

                            <td className="amount-input-column">
                              <input
                                className="rof-amount-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={
                                  row.actualAmount ===
                                  0
                                    ? ''
                                    : row.actualAmount
                                }
                                disabled={
                                  rofExists ||
                                  saving
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateCashActual(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </td>

                            <td
                              className={`numeric ${
                                variance ===
                                0
                                  ? ''
                                  : variance >
                                      0
                                    ? 'positive'
                                    : 'negative'
                              }`}
                            >
                              ₱
                              {formatMoney(
                                variance,
                              )}
                            </td>

                            <td>
                             <div className="rof-input-group">
  <input
    type="text"
    value={row.mod}
    className={
      isCashModMissing(row)
        ? 'rof-input-error'
        : ''
    }
    disabled={
      rofExists ||
      saving
    }
    onChange={(event) =>
      updateCashText(
        index,
        'mod',
        event.target.value,
      )
    }
  />

  {isCashModMissing(row) && (
    <span className="rof-validation-message">
      MOD is required.
    </span>
  )}
</div>
                            </td>

                            <td>
                              <input
                                type="text"
                                value={
                                  row.remarks
                                }
                                disabled={
                                  rofExists ||
                                  saving
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateCashText(
                                    index,
                                    'remarks',
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        )
                      },
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* NON-CASH */}

          <section className="rof-section">
            <div className="rof-section-header">
              <div>
                <h2>
                  Non-Cash
                  Remittance
                </h2>

                <p>
                  Card, digital,
                  and other tender
                  types.
                </p>
              </div>

              <div className="rof-summary">
                POS{' '}

                <strong>
                  ₱
                  {formatMoney(
                    nonCashTotals.pos,
                  )}
                </strong>

                <span />

                Actual{' '}

                <strong>
                  ₱
                  {formatMoney(
                    nonCashTotals.actual,
                  )}
                </strong>

                <span />

                Variance{' '}

                <strong
                  className={
                    nonCashVariance ===
                    0
                      ? ''
                      : nonCashVariance >
                          0
                        ? 'positive'
                        : 'negative'
                  }
                >
                  ₱
                  {formatMoney(
                    nonCashVariance,
                  )}
                </strong>
              </div>
            </div>

            <div className="rof-table-wrapper">
              <table className="rof-table">
                <thead>
                  <tr>
                    <th>
                      Tender
                    </th>

                    <th className="numeric">
                      POS Amount
                    </th>

                    <th className="amount-input-column">
                      Actual
                      Amount
                    </th>

                    <th className="numeric">
                      Variance
                    </th>

                    <th>
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {nonCashRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="rof-empty"
                      >
                        No
                        non-cash
                        data
                        loaded.
                      </td>
                    </tr>
                  ) : (
                    nonCashRows.map(
                      (
                        row,
                        index,
                      ) => {
                        const variance =
                          row.actualAmount -
                          row.posAmount

                        return (
                          <tr
                            key={`${row.tenderName}-${index}`}
                          >
                            <td>
                              {
                                row.tenderName
                              }
                            </td>

                            <td className="numeric">
                              ₱
                              {formatMoney(
                                row.posAmount,
                              )}
                            </td>

                            <td className="amount-input-column">
                              <input
                                className="rof-amount-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={
                                  row.actualAmount ===
                                  0
                                    ? ''
                                    : row.actualAmount
                                }
                                disabled={
                                  rofExists ||
                                  saving
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateNonCashActual(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </td>

                            <td
                              className={`numeric ${
                                variance ===
                                0
                                  ? ''
                                  : variance >
                                      0
                                    ? 'positive'
                                    : 'negative'
                              }`}
                            >
                              ₱
                              {formatMoney(
                                variance,
                              )}
                            </td>

                            <td>
                              <input
                                type="text"
                                value={
                                  row.remarks
                                }
                                disabled={
                                  rofExists ||
                                  saving
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateNonCashRemarks(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        )
                      },
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="rof-actions">
            {rofExists && (
              <button
                type="button"
                className="rof-delete-button"
                disabled={
                  isBusy
                }
                onClick={() =>
                  setShowDeleteConfirm(
                    true,
                  )
                }
              >
                <Trash2
                  size={18}
                />

                Delete ROF
              </button>
            )}

            <button
              type="button"
              className="rof-save-button"
              disabled={
                saving ||
                loading ||
                deleting ||
                rofExists ||
                cashRows.length ===
                  0 ||
                nonCashRows.length ===
                  0
              }
                onClick={requestSaveRof}
            >
              <Save
                size={18}
              />

              {saving
                ? 'Saving...'
                : 'Save ROF'}
            </button>
          </div>

          <ConfirmDialog
            open={
              showDeleteConfirm
            }
            title="Delete ROF?"
            message={`All ROF records for ${formatBusinessDate(
              businessDate,
            )} will be permanently deleted. This action cannot be undone.`}
            confirmText="Delete ROF"
            cancelText="Cancel"
            onConfirm={
              deleteRof
            }
            onCancel={() =>
              setShowDeleteConfirm(
                false,
              )
            }
          />
          <ConfirmDialog
  open={showSaveConfirm}
  title="Save ROF?"
  message={`Save the ROF details for ${formatBusinessDate(
    businessDate,
  )}? Please verify the actual amounts, MOD, and remarks before continuing.`}
  confirmText="Save ROF"
  cancelText="Cancel"
  onConfirm={() => {
    setShowSaveConfirm(false)
    void saveRof()
  }}
  onCancel={() =>
    setShowSaveConfirm(false)
  }
/>
        </>
      )}
    </div>
  )
}

export default RofPage