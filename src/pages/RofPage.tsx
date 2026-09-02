import {
  useMemo,
  useState,
} from 'react'

import {
  BarChart3,
  CalendarDays,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'

import {
  useAuth,
} from '../auth/useAuth'

import ConfirmDialog from '../components/common/ConfirmDialog'

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

type RofView =
  | 'summary'
  | 'details'

function formatMoney(
  value: number,
) {
  return value.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )
}

function todayString() {
  const now =
    new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )

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
  const {
    user,
  } = useAuth()

  // =========================================================
  // VIEW
  // =========================================================

  const [
    activeView,
    setActiveView,
  ] =
    useState<RofView>(
      'summary',
    )

  // =========================================================
  // SUMMARY ROF STATE
  // =========================================================

  const [
    dateFrom,
    setDateFrom,
  ] =
    useState(
      todayString(),
    )

  const [
    dateTo,
    setDateTo,
  ] =
    useState(
      todayString(),
    )

  const [
    summaryRows,
    setSummaryRows,
  ] =
    useState<
      SummaryRow[]
    >([])

  const [
    summaryLoading,
    setSummaryLoading,
  ] =
    useState(false)

  const [
    summaryMessage,
    setSummaryMessage,
  ] =
    useState(
      'Select a date range and generate the ROF summary.',
    )

  // =========================================================
  // DETAILS ROF STATE
  // =========================================================

  const [
    businessDate,
    setBusinessDate,
  ] =
    useState(
      todayString(),
    )

  const [
    cashRows,
    setCashRows,
  ] =
    useState<
      CashRow[]
    >([])

  const [
    nonCashRows,
    setNonCashRows,
  ] =
    useState<
      NonCashRow[]
    >([])

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    deleting,
    setDeleting,
  ] =
    useState(false)

  const [
    rofExists,
    setRofExists,
  ] =
    useState(false)

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] =
    useState(false)

  const [
    showSaveConfirm,
    setShowSaveConfirm,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState(
      'Select a business date and load POS data.',
    )

  const [
    showValidation,
    setShowValidation,
  ] =
    useState(false)

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
    setShowValidation(
      true,
    )

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

    setShowSaveConfirm(
      true,
    )
  }

  // =========================================================
  // BUSY OVERLAY
  // =========================================================

  const isBusy =
    loading ||
    saving ||
    deleting ||
    summaryLoading

  const busyMessage =
    deleting
      ? 'Deleting ROF...'
      : saving
        ? 'Saving ROF...'
        : summaryLoading
          ? 'Generating ROF Summary...'
          : 'Loading ROF data...'

  // =========================================================
  // DETAILS TOTALS
  // =========================================================

  const cashTotals =
    useMemo(() => {
      return cashRows.reduce(
        (
          result,
          row,
        ) => {
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
        (
          result,
          row,
        ) => {
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
        (
          total,
          row,
        ) => {
          total.netSalesVat +=
            row.netSalesVat

          total.vat +=
            row.vat

          total.netSales +=
            row.netSales

          total.gcSales +=
            row.gcSales

          total.cash +=
            row.cash

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

    if (
      !dateFrom ||
      !dateTo
    ) {
      setSummaryMessage(
        'Date From and Date To are required.',
      )

      return
    }

    if (
      dateTo <
      dateFrom
    ) {
      setSummaryMessage(
        'Date To cannot be earlier than Date From.',
      )

      return
    }

    try {
      setSummaryLoading(
        true,
      )

      setSummaryMessage(
        'Generating ROF summary...',
      )

      const result =
        await window.api.rof
          .loadSummary(
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
      setSummaryLoading(
        false,
      )
    }
  }

  // =========================================================
  // LOAD DETAILS / POS DATA
  // =========================================================

  async function loadData() {
    try {
      setShowValidation(
        false,
      )

      setLoading(
        true,
      )

      setMessage(
        `Loading ROF data for ${businessDate}...`,
      )

      const source =
        await window.api.rof
          .loadSource(
            businessDate,
          )

      setRofExists(
        source.exists,
      )

      if (source.exists) {
        const details =
          await window.api.rof
            .loadDetails(
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

            actualAmount:
              0,

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

            actualAmount:
              0,

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
      setRofExists(
        false,
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load ROF data.',
      )
    } finally {
      setLoading(
        false,
      )
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

      setDeleting(
        true,
      )

      setMessage(
        'Deleting ROF...',
      )

      const result =
        await window.api.rof
          .delete(
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
      setRofExists(
        false,
      )

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
      setDeleting(
        false,
      )
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
    setShowSaveConfirm(
      false,
    )

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
      setSaving(
        true,
      )

      setMessage(
        'Saving ROF...',
      )

      const result =
        await window.api.rof
          .create({
            businessDate,

            locationName:
              user.locationName,

            cash:
              cashRows,

            nonCash:
              nonCashRows,
          })

      setMessage(
        result.message,
      )

      if (result.success) {
        setRofExists(
          true,
        )

        setShowValidation(
          false,
        )
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
      setSaving(
        false,
      )
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="position-relative">

      {/* BUSY OVERLAY */}

      {isBusy && (
        <div
          className="
            position-absolute
            top-0
            start-0
            w-100
            h-100
            d-flex
            align-items-center
            justify-content-center
            bg-white
            bg-opacity-75
            rounded-4
          "
          style={{
            zIndex: 100,
            minHeight: '100%',
          }}
        >
          <div
            className="
              bg-white
              border
              rounded-4
              shadow-sm
              text-center
              px-5
              py-4
            "
          >
            <div
              className="
                spinner-border
                text-primary
                mb-3
              "
              role="status"
            />

            <div className="fw-semibold mb-1">
              {busyMessage}
            </div>

            <small className="text-secondary">
              Please wait while the transaction
              is being processed.
            </small>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}

      <div
        className="
          d-flex
          flex-column
          flex-lg-row
          align-items-lg-start
          justify-content-between
          gap-3
          mb-4
        "
      >
        <div>
          <h1 className="h4 fw-bold mb-2">
            Remittance of Fund
          </h1>

          <p className="text-secondary mb-0">
            Cash and non-cash remittance monitoring
            per business date.
          </p>
        </div>

        <span
          className="
            badge
            rounded-pill
            px-3
            py-2
            rof-location-badge
            align-self-start
          "
        >
          {user?.locationName ??
            'Unknown location'}
        </span>
      </div>

      {/* VIEW TABS */}

      <div className="mb-4">
        <div
          className="
            btn-group
            bg-light
            border
            rounded-3
            p-1
          "
          role="group"
        >
          <button
            type="button"
            className={`btn d-flex align-items-center gap-2 ${
              activeView ===
              'summary'
                ? 'btn-primary'
                : 'btn-light'
            }`}
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
            className={`btn d-flex align-items-center gap-2 ${
              activeView ===
              'details'
                ? 'btn-primary'
                : 'btn-light'
            }`}
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
      </div>

      {activeView ===
      'summary' ? (
        <>
          {/* SUMMARY FILTER */}

          <section
            className="
              card
              border
              rounded-4
              mb-3
            "
          >
            <div className="card-body">
              <div className="row g-3 align-items-end">

                <div className="col-12 col-md-4 col-xl-3">
                  <label
                    htmlFor="rof-date-from"
                    className="
                      form-label
                      fw-semibold
                      small
                      d-flex
                      align-items-center
                      gap-2
                    "
                  >
                    <CalendarDays
                      size={16}
                    />

                    Date From
                  </label>

                  <input
                    id="rof-date-from"
                    type="date"
                    className="form-control"
                    value={
                      dateFrom
                    }
                    max={
                      todayString()
                    }
                    disabled={
                      summaryLoading
                    }
                    onChange={(
                      event,
                    ) => {
                      setDateFrom(
                        event.target
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

                <div className="col-12 col-md-4 col-xl-3">
                  <label
                    htmlFor="rof-date-to"
                    className="
                      form-label
                      fw-semibold
                      small
                      d-flex
                      align-items-center
                      gap-2
                    "
                  >
                    <CalendarDays
                      size={16}
                    />

                    Date To
                  </label>

                  <input
                    id="rof-date-to"
                    type="date"
                    className="form-control"
                    value={
                      dateTo
                    }
                    max={
                      todayString()
                    }
                    disabled={
                      summaryLoading
                    }
                    onChange={(
                      event,
                    ) => {
                      setDateTo(
                        event.target
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

                <div className="col-12 col-md-auto">
                  <button
                    type="button"
                    className="
                      btn
                      btn-primary
                      d-flex
                      align-items-center
                      justify-content-center
                      gap-2
                      w-100
                    "
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
                      className={
                        summaryLoading
                          ? 'spin'
                          : ''
                      }
                    />

                    {summaryLoading
                      ? 'Generating...'
                      : 'Generate'}
                  </button>
                </div>

              </div>
            </div>
          </section>

          <div
            className="
              alert
              alert-light
              border
              py-2
              small
              mb-3
            "
          >
            {summaryMessage}
          </div>

          {/* SUMMARY TABLE */}

          <section
            className="
              card
              border
              rounded-4
              overflow-hidden
              mb-4
            "
          >
            <div
              className="
                card-header
                bg-white
                border-bottom
                d-flex
                align-items-center
                justify-content-between
                gap-3
                py-3
              "
            >
              <div>
                <h2 className="h6 fw-bold mb-1">
                  ROF Summary
                </h2>

                <p className="small text-secondary mb-0">
                  Consolidated remittance summary
                  per business date.
                </p>
              </div>

              <span
                className="
                  badge
                  rounded-pill
                  rof-location-badge
                "
              >
                {summaryRows.length}{' '}
                day
                {summaryRows.length ===
                1
                  ? ''
                  : 's'}
              </span>
            </div>

            <div className="table-responsive">
              <table
                className="
                  table
                  table-hover
                  align-middle
                  mb-0
                  small
                  rof-summary-table-bootstrap
                "
              >
                <thead className="table-light">
                  <tr>
                    <th>
                      Business Date
                    </th>

                    <th className="text-end">
                      Net Sales w/ VAT
                    </th>

                    <th className="text-end">
                      VAT
                    </th>

                    <th className="text-end">
                      Net Sales
                    </th>

                    <th className="text-end">
                      GC / Srvc Charge
                    </th>

                    <th className="text-end">
                      Cash Remitted
                    </th>

                    <th className="text-end">
                      Non-Cash Remitted
                    </th>

                    <th className="text-end">
                      Variance
                    </th>

                    <th>
                      Cash Remarks
                    </th>

                    <th>
                      Non-Cash Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {summaryRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="
                          text-center
                          text-secondary
                          py-5
                        "
                      >
                        No summary records loaded.
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

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.netSalesVat,
                              )}
                            </td>

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.vat,
                              )}
                            </td>

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.netSales,
                              )}
                            </td>

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.gcSales,
                              )}
                            </td>

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.cash,
                              )}
                            </td>

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.nonCash,
                              )}
                            </td>

                            <td
                              className={`text-end fw-semibold ${
                                row.variance ===
                                0
                                  ? ''
                                  : row.variance >
                                      0
                                    ? 'text-warning'
                                    : 'text-danger'
                              }`}
                            >
                              ₱
                              {formatMoney(
                                row.variance,
                              )}
                            </td>

                            <td>
                              {row.cashRemarks ||
                                '—'}
                            </td>

                            <td>
                              {row.nonCashRemarks ||
                                '—'}
                            </td>
                          </tr>
                        ),
                      )}

                      <tr className="table-light fw-bold">
                        <td>
                          TOTAL
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.netSalesVat,
                          )}
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.vat,
                          )}
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.netSales,
                          )}
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.gcSales,
                          )}
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.cash,
                          )}
                        </td>

                        <td className="text-end">
                          ₱
                          {formatMoney(
                            summaryTotals.nonCash,
                          )}
                        </td>

                        <td
                          className={`text-end ${
                            summaryTotals.variance ===
                            0
                              ? ''
                              : summaryTotals.variance >
                                  0
                                ? 'text-warning'
                                : 'text-danger'
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
          {/* DETAILS FILTER */}

          <section
            className="
              card
              border
              rounded-4
              mb-3
            "
          >
            <div className="card-body">
              <div className="row g-3 align-items-end">

                <div className="col-12 col-md-4 col-xl-3">
                  <label
                    htmlFor="rof-business-date"
                    className="
                      form-label
                      fw-semibold
                      small
                      d-flex
                      align-items-center
                      gap-2
                    "
                  >
                    <CalendarDays
                      size={16}
                    />

                    Business Date
                  </label>

                  <input
                    id="rof-business-date"
                    type="date"
                    className="form-control"
                    value={
                      businessDate
                    }
                    max={
                      todayString()
                    }
                    disabled={
                      isBusy
                    }
                    onChange={(
                      event,
                    ) => {
                      setBusinessDate(
                        event.target
                          .value,
                      )

                      setCashRows([])
                      setNonCashRows([])
                      setRofExists(
                        false,
                      )
                      setShowValidation(
                        false,
                      )

                      setMessage(
                        'Click Load POS Data to continue.',
                      )
                    }}
                  />
                </div>

                <div className="col-12 col-md-auto">
                  <button
                    type="button"
                    className="
                      btn
                      btn-primary
                      d-flex
                      align-items-center
                      justify-content-center
                      gap-2
                      w-100
                    "
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
                      className={
                        loading
                          ? 'spin'
                          : ''
                      }
                    />

                    {loading
                      ? 'Loading...'
                      : 'Load POS Data'}
                  </button>
                </div>

              </div>
            </div>
          </section>

          <div
            className={`alert py-2 small mb-3 ${
              rofExists
                ? 'alert-warning'
                : 'alert-light border'
            }`}
          >
            {message}
          </div>

          {/* CASH */}

          <RofSectionHeader
            title="Cash Remittance"
            description="Cash tender grouped by cashier."
            pos={
              cashTotals.pos
            }
            actual={
              cashTotals.actual
            }
            variance={
              cashVariance
            }
          />

          <section
            className="
              card
              border
              rounded-bottom-4
              overflow-hidden
              mb-4
            "
          >
            <div className="table-responsive">
              <table
                className="
                  table
                  table-hover
                  align-middle
                  mb-0
                  small
                  rof-detail-table
                "
              >
                <thead className="table-light">
                  <tr>
                    <th>
                      Cashier
                    </th>

                    <th>
                      Tender
                    </th>

                    <th className="text-end">
                      POS Amount
                    </th>

                    <th>
                      Actual Amount
                    </th>

                    <th className="text-end">
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
                        colSpan={7}
                        className="
                          text-center
                          text-secondary
                          py-5
                        "
                      >
                        No cash data loaded.
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

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.posAmount,
                              )}
                            </td>

                            <td>
                              <input
                                className="
                                  form-control
                                  form-control-sm
                                  text-end
                                  rof-money-input
                                "
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
                                    event.target
                                      .value,
                                  )
                                }
                              />
                            </td>

                            <td
                              className={`text-end fw-semibold ${
                                variance ===
                                0
                                  ? ''
                                  : variance >
                                      0
                                    ? 'text-warning'
                                    : 'text-danger'
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
                                className={`form-control form-control-sm ${
                                  isCashModMissing(
                                    row,
                                  )
                                    ? 'is-invalid'
                                    : ''
                                }`}
                                value={
                                  row.mod
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
                                    'mod',
                                    event.target
                                      .value,
                                  )
                                }
                              />

                              {isCashModMissing(
                                row,
                              ) && (
                                <div className="invalid-feedback">
                                  MOD is required.
                                </div>
                              )}
                            </td>

                            <td>
                              <input
                                type="text"
                                className="
                                  form-control
                                  form-control-sm
                                "
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

          {/* NON-CASH */}

          <RofSectionHeader
            title="Non-Cash Remittance"
            description="Card, digital, and other tender types."
            pos={
              nonCashTotals.pos
            }
            actual={
              nonCashTotals.actual
            }
            variance={
              nonCashVariance
            }
          />

          <section
            className="
              card
              border
              rounded-bottom-4
              overflow-hidden
              mb-4
            "
          >
            <div className="table-responsive">
              <table
                className="
                  table
                  table-hover
                  align-middle
                  mb-0
                  small
                  rof-detail-table
                "
              >
                <thead className="table-light">
                  <tr>
                    <th>
                      Tender
                    </th>

                    <th className="text-end">
                      POS Amount
                    </th>

                    <th>
                      Actual Amount
                    </th>

                    <th className="text-end">
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
                        colSpan={5}
                        className="
                          text-center
                          text-secondary
                          py-5
                        "
                      >
                        No non-cash data loaded.
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

                            <td className="text-end">
                              ₱
                              {formatMoney(
                                row.posAmount,
                              )}
                            </td>

                            <td>
                              <input
                                className="
                                  form-control
                                  form-control-sm
                                  text-end
                                  rof-money-input
                                "
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
                                    event.target
                                      .value,
                                  )
                                }
                              />
                            </td>

                            <td
                              className={`text-end fw-semibold ${
                                variance ===
                                0
                                  ? ''
                                  : variance >
                                      0
                                    ? 'text-warning'
                                    : 'text-danger'
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
                                className="
                                  form-control
                                  form-control-sm
                                "
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

          {/* ACTIONS */}

          <div
            className="
              d-flex
              justify-content-end
              gap-2
              mb-3
            "
          >
            {rofExists && (
              <button
                type="button"
                className="
                  btn
                  btn-outline-danger
                  d-flex
                  align-items-center
                  gap-2
                "
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
              className="
                btn
                btn-primary
                d-flex
                align-items-center
                gap-2
              "
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
              onClick={
                requestSaveRof
              }
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
            variant="danger"
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
            open={
              showSaveConfirm
            }
            title="Save ROF?"
            message={`Save the ROF details for ${formatBusinessDate(
              businessDate,
            )}? Please verify the actual amounts, MOD, and remarks before continuing.`}
            confirmText="Save ROF"
            cancelText="Cancel"
            onConfirm={() => {
              setShowSaveConfirm(
                false,
              )

              void saveRof()
            }}
            onCancel={() =>
              setShowSaveConfirm(
                false,
              )
            }
          />
        </>
      )}
    </div>
  )
}

interface RofSectionHeaderProps {
  title: string
  description: string
  pos: number
  actual: number
  variance: number
}

function RofSectionHeader({
  title,
  description,
  pos,
  actual,
  variance,
}: RofSectionHeaderProps) {
  return (
    <div
      className="
        bg-white
        border
        border-bottom-0
        rounded-top-4
        px-3
        py-3
        d-flex
        flex-column
        flex-xl-row
        align-items-xl-center
        justify-content-between
        gap-3
      "
    >
      <div>
        <h2 className="h6 fw-bold mb-1">
          {title}
        </h2>

        <p className="small text-secondary mb-0">
          {description}
        </p>
      </div>

      <div
        className="
          d-flex
          flex-wrap
          align-items-center
          gap-3
          small
        "
      >
        <span>
          <span className="text-secondary">
            POS
          </span>{' '}

          <strong>
            ₱
            {formatMoney(
              pos,
            )}
          </strong>
        </span>

        <span>
          <span className="text-secondary">
            Actual
          </span>{' '}

          <strong>
            ₱
            {formatMoney(
              actual,
            )}
          </strong>
        </span>

        <span>
          <span className="text-secondary">
            Variance
          </span>{' '}

          <strong
            className={
              variance ===
              0
                ? ''
                : variance >
                    0
                  ? 'text-warning'
                  : 'text-danger'
            }
          >
            ₱
            {formatMoney(
              variance,
            )}
          </strong>
        </span>
      </div>
    </div>
  )
}

export default RofPage
