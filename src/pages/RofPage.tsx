import { useMemo, useState } from 'react'
import {
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
  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function RofPage() {
  const { user } = useAuth()

  const [businessDate, setBusinessDate] =
    useState(todayString())

  const [cashRows, setCashRows] =
    useState<CashRow[]>([])

  const [nonCashRows, setNonCashRows] =
    useState<NonCashRow[]>([])

  const [loading, setLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [rofExists, setRofExists] =
    useState(false)

  const [message, setMessage] =
    useState('Select a business date and load POS data.')

 const [deleting, setDeleting] =
  useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] =
  useState(false)
    

const isBusy =
  loading || saving || deleting

const busyMessage = deleting
  ? 'Deleting ROF...'
  : saving
    ? 'Saving ROF...'
    : 'Loading ROF data...'



  const cashTotals = useMemo(() => {
    return cashRows.reduce(
      (result, row) => {
        result.pos += row.posAmount
        result.actual += row.actualAmount
        return result
      },
      {
        pos: 0,
        actual: 0,
      },
    )
  }, [cashRows])

  const nonCashTotals = useMemo(() => {
    return nonCashRows.reduce(
      (result, row) => {
        result.pos += row.posAmount
        result.actual += row.actualAmount
        return result
      },
      {
        pos: 0,
        actual: 0,
      },
    )
  }, [nonCashRows])

  const cashVariance =
    cashTotals.actual - cashTotals.pos

  const nonCashVariance =
    nonCashTotals.actual - nonCashTotals.pos

  async function loadData() {
    try {
      setLoading(true)
      setMessage(
        `Loading ROF data for ${businessDate}...`,
      )

      const source =
        await window.api.rof.loadSource(
          businessDate,
        )

      setRofExists(source.exists)

      if (source.exists) {
        const details =
          await window.api.rof.loadDetails(
            businessDate,
          )

        setCashRows(details.cash)
        setNonCashRows(details.nonCash)

        setMessage(
          'ROF already exists for this business date.',
        )

        return
      }

      setCashRows(
        source.cash.map((row) => ({
          cashierName: row.cashierName,
          tenderName: row.tenderName,
          posAmount: row.posAmount,
          actualAmount: 0,
          mod: '',
          remarks: '',
        })),
      )

      setNonCashRows(
        source.nonCash.map((row) => ({
          tenderName: row.tenderName,
          posAmount: row.posAmount,
          actualAmount: 0,
          remarks: '',
        })),
      )

      if (
        source.cash.length === 0 &&
        source.nonCash.length === 0
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

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load ROF data.',
      )
    } finally {
      setLoading(false)
    }
  }
async function deleteRof() {
  if (!rofExists) {
    setMessage(
      'No ROF exists for this business date.',
    )
    return
  }

  try {
    setShowDeleteConfirm(false)
    setDeleting(true)
    setMessage('Deleting ROF...')

    const result =
      await window.api.rof.delete(
        businessDate,
      )

    setMessage(result.message)

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


 function updateCashActual(
  index: number,
  value: string,
) {
  const amount = Number(value)

  setCashRows((current) =>
    current.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            actualAmount:
              Number.isFinite(amount)
                ? amount
                : 0,
          }
        : row,
    ),
  )
}

  function updateCashText(
    index: number,
    field: 'mod' | 'remarks',
    value: string,
  ) {
    setCashRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    )
  }

  function updateNonCashActual(
    index: number,
    value: string,
  ) {
    const amount = Number(value)

    setNonCashRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              actualAmount:
                Number.isFinite(amount)
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
    setNonCashRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              remarks: value,
            }
          : row,
      ),
    )
  }

  async function saveRof() {
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
      setMessage('Saving ROF...')

      const result =
        await window.api.rof.create({
          businessDate,
          locationName: user.locationName,
          cash: cashRows,
          nonCash: nonCashRows,
        })

      setMessage(result.message)

      if (result.success) {
        setRofExists(true)
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
            Please wait while the transaction is being processed.
          </div>
        </div>
      </div>
    )}
      <div className="rof-page-header">
        <div>
          <h1>Remittance of Fund</h1>

          <p>
            Cash and non-cash remittance monitoring per business date.
          </p>
        </div>

        <div className="rof-location">
          {user?.locationName ?? 'Unknown location'}
        </div>
      </div>

      <section className="rof-filter-card">
        <div className="rof-date-field">
          <label htmlFor="rof-business-date">
            <CalendarDays size={17} />
            Business Date
          </label>

          <input
            id="rof-business-date"
            type="date"
            value={businessDate}
            max={todayString()}
            disabled={loading || saving}
            onChange={(event) => {
              setBusinessDate(
                event.target.value,
              )

              setCashRows([])
              setNonCashRows([])
              setRofExists(false)

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
            loading ||
            saving ||
            !businessDate
          }
          onClick={loadData}
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

      <section className="rof-section">
        <div className="rof-section-header">
          <div>
            <h2>Cash Remittance</h2>

            <p>
              Cash tender grouped by cashier.
            </p>
          </div>

          <div className="rof-summary">
            POS{' '}
            <strong>
              ₱{formatMoney(cashTotals.pos)}
            </strong>

            <span />

            Actual{' '}
            <strong>
              ₱{formatMoney(cashTotals.actual)}
            </strong>

            <span />

            Variance{' '}
            <strong
              className={
                cashVariance === 0
                  ? ''
                  : cashVariance > 0
                    ? 'positive'
                    : 'negative'
              }
            >
              ₱{formatMoney(cashVariance)}
            </strong>
          </div>
        </div>

        <div className="rof-table-wrapper">
          <table className="rof-table">
            <thead>
              <tr>
                <th>Cashier</th>
                <th>Tender</th>
                <th className="numeric">
                  POS Amount
                </th>
                <th className="amount-input-column">
                  Actual Amount
                </th>
                <th className="numeric">
                  Variance
                </th>
                <th>MOD</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {cashRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="rof-empty"
                  >
                    No cash data loaded.
                  </td>
                </tr>
              ) : (
                cashRows.map(
                  (row, index) => {
                    const variance =
                      row.actualAmount -
                      row.posAmount

                    return (
                      <tr
                        key={`${row.cashierName}-${index}`}
                      >
                        <td>
                          {row.cashierName}
                        </td>

                        <td>
                          {row.tenderName}
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
    row.actualAmount === 0
      ? ''
      : row.actualAmount
  }
  disabled={rofExists || saving}
  onChange={(event) =>
    updateCashActual(
      index,
      event.target.value,
    )
  }
/>
                        </td>

                        <td
                          className={`numeric ${
                            variance === 0
                              ? ''
                              : variance > 0
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
                            value={row.mod}
                            disabled={
                              rofExists ||
                              saving
                            }
                            onChange={(
                              event,
                            ) =>
                              updateCashText(
                                index,
                                'mod',
                                event.target
                                  .value,
                              )
                            }
                          />
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
                                event.target
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



      <section className="rof-section">
        <div className="rof-section-header">
          <div>
            <h2>Non-Cash Remittance</h2>

            <p>
              Card, digital, and other tender
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
                nonCashVariance === 0
                  ? ''
                  : nonCashVariance > 0
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
                <th>Tender</th>
                <th className="numeric">
                  POS Amount
                </th>
                <th className="amount-input-column">
                  Actual Amount
                </th>
                <th className="numeric">
                  Variance
                </th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {nonCashRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="rof-empty"
                  >
                    No non-cash data loaded.
                  </td>
                </tr>
              ) : (
                nonCashRows.map(
                  (row, index) => {
                    const variance =
                      row.actualAmount -
                      row.posAmount

                    return (
                      <tr
                        key={`${row.tenderName}-${index}`}
                      >
                        <td>
                          {row.tenderName}
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
    row.actualAmount === 0
      ? ''
      : row.actualAmount
  }
  disabled={rofExists || saving}
  onChange={(event) =>
    updateNonCashActual(
      index,
      event.target.value,
    )
  }
/>
                        </td>

                        <td
                          className={`numeric ${
                            variance === 0
                              ? ''
                              : variance > 0
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
                                event.target
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

    <div className="rof-actions">
  {rofExists && (
    <button
      type="button"
      className="rof-delete-button"
      disabled={
        loading ||
        saving ||
        deleting
      }
      onClick={() => setShowDeleteConfirm(true)}
    >
      <Trash2 size={18} />
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
      cashRows.length === 0 ||
      nonCashRows.length === 0
    }
    onClick={saveRof}
  >
    <Save size={18} />

    {saving
      ? 'Saving...'
      : 'Save ROF'}
  </button>
</div>
<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete ROF?"
  message={`All ROF records for ${formatBusinessDate(
    businessDate,
  )} will be permanently deleted. This action cannot be undone.`}
  confirmText="Delete ROF"
  cancelText="Cancel"
  variant="danger"
  onConfirm={deleteRof}
  onCancel={() =>
    setShowDeleteConfirm(false)
  }
/>
    </div>
  )
}

export default RofPage