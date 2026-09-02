import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FileText,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  WalletCards,
  X,
} from 'lucide-react'

import {
  useAuth,
} from '../auth/useAuth'

import ConfirmDialog from '../components/common/ConfirmDialog'

interface DepositRecord {
  depositId: number
  locationName: string
  businessDate: string
  depositDate: string
  depositReference: string
  posAmount: number
  depositAmount: number
  pettyCash: number
  bir2307: number
  openSales: number
  otherDepartmentExpense: number
  variance: number
  filename: string
}

function todayString() {
  const now = new Date()

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

function formatDate(
  value: string,
) {
  if (!value) {
    return '—'
  }

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(
    'en-PH',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )
}

function toNumber(
  value: string,
) {
  const parsed =
    Number(value)

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0
}

function DepositPage() {
  const {
    user,
  } = useAuth()

  // =========================================================
  // FORM MODAL
  // =========================================================

  const [
    showFormModal,
    setShowFormModal,
  ] =
    useState(false)

  const [
    businessDate,
    setBusinessDate,
  ] =
    useState(
      todayString(),
    )

  const [
    depositDate,
    setDepositDate,
  ] =
    useState(
      todayString(),
    )

  const [
    depositReference,
    setDepositReference,
  ] =
    useState('')

  const [
    posAmount,
    setPosAmount,
  ] =
    useState(0)

  const [
    depositAmount,
    setDepositAmount,
  ] =
    useState(0)

  const [
    pettyCash,
    setPettyCash,
  ] =
    useState(0)

  const [
    bir2307,
    setBir2307,
  ] =
    useState(0)

  const [
    openSales,
    setOpenSales,
  ] =
    useState(0)

  const [
    otherDepartmentExpense,
    setOtherDepartmentExpense,
  ] =
    useState(0)

  const [
    filename,
    setFilename,
  ] =
    useState('')

  const [
    localFilePath,
    setLocalFilePath,
  ] =
    useState('')

  const [
    previewDataUrl,
    setPreviewDataUrl,
  ] =
    useState('')

  const [
    rofLoaded,
    setRofLoaded,
  ] =
    useState(false)

  const [
    editingDepositId,
    setEditingDepositId,
  ] =
    useState<number | null>(
      null,
    )

  const [
    formMessage,
    setFormMessage,
  ] =
    useState(
      'Select a business date and load the ROF.',
    )

  // =========================================================
  // HISTORY
  // =========================================================

  const [
    rows,
    setRows,
  ] =
    useState<
      DepositRecord[]
    >([])

  const [
    page,
    setPage,
  ] =
    useState(1)

  const [
    pageSize,
    setPageSize,
  ] =
    useState(10)

  const [
    totalRecords,
    setTotalRecords,
  ] =
    useState(0)

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(0)

  const [
    keyword,
    setKeyword,
  ] =
    useState('')

  const [
    month,
    setMonth,
  ] =
    useState('')

  const [
    year,
    setYear,
  ] =
    useState(
      String(
        new Date()
          .getFullYear(),
      ),
    )

  const [
    historyMessage,
    setHistoryMessage,
  ] =
    useState(
      'Loading deposit history...',
    )

  // =========================================================
  // ATTACHMENT VIEWER
  // =========================================================

  const [
    attachmentTarget,
    setAttachmentTarget,
  ] =
    useState<DepositRecord | null>(
      null,
    )

  const [
    attachmentPreview,
    setAttachmentPreview,
  ] =
    useState('')

  const [
    attachmentMessage,
    setAttachmentMessage,
  ] =
    useState('')

  const [
    loadingAttachment,
    setLoadingAttachment,
  ] =
    useState(false)

  const [
    downloadingAttachment,
    setDownloadingAttachment,
  ] =
    useState(false)

  const [
    replacingAttachment,
    setReplacingAttachment,
  ] =
    useState(false)

  const [
    attachmentZoom,
    setAttachmentZoom,
  ] =
    useState(1)

  const [
    attachmentRotation,
    setAttachmentRotation,
  ] =
    useState(0)

  // =========================================================
  // BUSY / DIALOGS
  // =========================================================

  const [
    loadingRof,
    setLoadingRof,
  ] =
    useState(false)

  const [
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(false)

  const [
    loadingRecord,
    setLoadingRecord,
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
    showSaveConfirm,
    setShowSaveConfirm,
  ] =
    useState(false)

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<
      DepositRecord | null
    >(null)

  const isEditing =
    editingDepositId !==
    null

  const formBusy =
    loadingRof ||
    loadingRecord ||
    saving ||
    deleting

  const formMessageClass =
    getNoticeClass(
      formMessage,
    )

  const historyMessageClass =
    getNoticeClass(
      historyMessage,
    )

  const busyOverlayMessage =
    saving
      ? isEditing
        ? 'Updating deposit...'
        : 'Saving deposit...'
      : deleting
        ? 'Deleting deposit...'
        : loadingRof
          ? 'Loading ROF...'
          : ''

  const variance =
    useMemo(
      () =>
        depositAmount +
        pettyCash +
        bir2307 +
        openSales +
        otherDepartmentExpense -
        posAmount,
      [
        depositAmount,
        pettyCash,
        bir2307,
        openSales,
        otherDepartmentExpense,
        posAmount,
      ],
    )

  function resetForm() {
    setBusinessDate(
      todayString(),
    )

    setDepositDate(
      todayString(),
    )

    setDepositReference(
      '',
    )

    setPosAmount(
      0,
    )

    setDepositAmount(
      0,
    )

    setPettyCash(
      0,
    )

    setBir2307(
      0,
    )

    setOpenSales(
      0,
    )

    setOtherDepartmentExpense(
      0,
    )

    setFilename(
      '',
    )

    setLocalFilePath(
      '',
    )

    setPreviewDataUrl(
      '',
    )

    setRofLoaded(
      false,
    )

    setEditingDepositId(
      null,
    )

    setFormMessage(
      'Select a business date and load the ROF.',
    )
  }

  function openNewDeposit() {
    resetForm()

    setShowFormModal(
      true,
    )
  }

  function closeFormModal() {
    if (formBusy) {
      return
    }

    setShowSaveConfirm(
      false,
    )

    setShowFormModal(
      false,
    )
  }

  // =========================================================
  // ROF SOURCE
  // =========================================================

  async function loadRof() {
    if (!user) {
      setFormMessage(
        'Unable to determine logged-in location.',
      )

      return
    }

    if (!businessDate) {
      setFormMessage(
        'Business Date is required.',
      )

      return
    }

    try {
      setLoadingRof(
        true,
      )

      setRofLoaded(
        false,
      )

      setFormMessage(
        'Loading ROF...',
      )

      const source =
        await window.api.rof
          .getDepositSource(
            businessDate,
          )

      if (!source.exists) {
        setPosAmount(
          0,
        )

        setDepositAmount(
          0,
        )

        setFormMessage(
          source.message,
        )

        return
      }

      const status =
        await window.api.deposit
          .checkStatus(
            businessDate,
            user.locationName,
          )

      if (
        status.exists &&
        status.depositId
      ) {
        setFormMessage(
          'A deposit already exists for this business date. Edit it from Deposit History.',
        )

        return
      }

      setPosAmount(
        source.posAmount,
      )

      setDepositAmount(
        source.actualAmount,
      )

      setRofLoaded(
        true,
      )

      setFormMessage(
        'ROF loaded successfully. Enter the deposit details.',
      )
    } catch (error) {
      console.error(
        'Unable to load ROF:',
        error,
      )

      setRofLoaded(
        false,
      )

      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load ROF.',
      )
    } finally {
      setLoadingRof(
        false,
      )
    }
  }

  // =========================================================
  // ATTACHMENT PICKER
  // =========================================================

  async function browseAttachment() {
    try {
      const result =
        await window.api.deposit
          .selectAttachment()

      if (result.canceled) {
        return
      }

      setLocalFilePath(
        result.filePath,
      )

      setFilename(
        result.fileName,
      )

      setPreviewDataUrl(
        result.previewDataUrl,
      )

      setFormMessage(
        'Attachment selected successfully.',
      )
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Unable to select attachment.',
      )
    }
  }

  // =========================================================
  // HISTORY
  // =========================================================

  async function loadHistory(
    targetPage = page,
    targetPageSize = pageSize,
  ) {
    if (!user) {
      return
    }

    try {
      setLoadingHistory(
        true,
      )

      setHistoryMessage(
        'Loading deposit history...',
      )

      const result =
        await window.api.deposit
          .list({
            locationName:
              user.locationName,

            page:
              targetPage,

            pageSize:
              targetPageSize,

            keyword:
              keyword.trim() ||
              undefined,

            month:
              month
                ? Number(month)
                : undefined,

            year:
              year
                ? Number(year)
                : undefined,
          })

      if (!result.success) {
        setRows([])

        setTotalRecords(
          0,
        )

        setTotalPages(
          0,
        )

        setHistoryMessage(
          result.message,
        )

        return
      }

      setRows(
        result.rows,
      )

      setTotalRecords(
        result.totalRecords,
      )

      setTotalPages(
        result.totalPages,
      )

      setHistoryMessage(
        result.totalRecords ===
          0
          ? 'No deposit records found.'
          : `${result.totalRecords} deposit record(s) found.`,
      )
    } catch (error) {
      console.error(
        'Unable to load deposit history:',
        error,
      )

      setRows([])

      setTotalRecords(
        0,
      )

      setTotalPages(
        0,
      )

      setHistoryMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load deposit history.',
      )
    } finally {
      setLoadingHistory(
        false,
      )
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled =
      false

    const locationName =
      user.locationName

    window.api.deposit
      .list({
        locationName,

        page: 1,

        pageSize: 10,

        year:
          new Date()
            .getFullYear(),
      })
      .then(
        (
          result,
        ) => {
          if (cancelled) {
            return
          }

          if (!result.success) {
            setRows([])

            setTotalRecords(
              0,
            )

            setTotalPages(
              0,
            )

            setHistoryMessage(
              result.message,
            )

            return
          }

          setRows(
            result.rows,
          )

          setTotalRecords(
            result.totalRecords,
          )

          setTotalPages(
            result.totalPages,
          )

          setHistoryMessage(
            result.totalRecords ===
              0
              ? 'No deposit records found.'
              : `${result.totalRecords} deposit record(s) found.`,
          )
        },
      )
      .catch(
        (
          error,
        ) => {
          if (cancelled) {
            return
          }

          console.error(
            'Unable to load deposit history:',
            error,
          )

          setRows([])

          setTotalRecords(
            0,
          )

          setTotalPages(
            0,
          )

          setHistoryMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load deposit history.',
          )
        },
      )
      .finally(
        () => {
          if (
            !cancelled
          ) {
            setLoadingHistory(
              false,
            )
          }
        },
      )

    return () => {
      cancelled =
        true
    }
  }, [user])

  async function applyFilters() {
    setPage(
      1,
    )

    await loadHistory(
      1,
      pageSize,
    )
  }

  async function changePage(
    nextPage: number,
  ) {
    if (
      nextPage < 1 ||
      nextPage >
        Math.max(
          totalPages,
          1,
        ) ||
      nextPage === page
    ) {
      return
    }

    setPage(
      nextPage,
    )

    await loadHistory(
      nextPage,
      pageSize,
    )
  }

  async function changePageSize(
    nextSize: number,
  ) {
    setPageSize(
      nextSize,
    )

    setPage(
      1,
    )

    await loadHistory(
      1,
      nextSize,
    )
  }

  // =========================================================
  // EDIT
  // =========================================================

  async function editFromHistory(
    row: DepositRecord,
  ) {
    if (!user) {
      return
    }

    try {
      setLoadingRecord(
        true,
      )

      const result =
        await window.api.deposit
          .getById(
            row.depositId,
            user.locationName,
          )

      if (
        !result.success ||
        !result.deposit
      ) {
        setHistoryMessage(
          result.message,
        )

        return
      }

      const deposit =
        result.deposit

      setEditingDepositId(
        deposit.depositId,
      )

      setBusinessDate(
        deposit.businessDate,
      )

      setDepositDate(
        deposit.depositDate,
      )

      setDepositReference(
        deposit.depositReference,
      )

      setPosAmount(
        deposit.posAmount,
      )

      setDepositAmount(
        deposit.depositAmount,
      )

      setPettyCash(
        deposit.pettyCash,
      )

      setBir2307(
        deposit.bir2307,
      )

      setOpenSales(
        deposit.openSales,
      )

      setOtherDepartmentExpense(
        deposit.otherDepartmentExpense,
      )

      setFilename(
        deposit.filename,
      )

      setLocalFilePath(
        '',
      )

      setPreviewDataUrl(
        '',
      )

      setRofLoaded(
        true,
      )

      setFormMessage(
        `Editing Deposit #${deposit.depositId}.`,
      )

      setShowFormModal(
        true,
      )
    } catch (error) {
      console.error(
        'Unable to load deposit:',
        error,
      )

      setHistoryMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load deposit.',
      )
    } finally {
      setLoadingRecord(
        false,
      )
    }
  }

  // =========================================================
  // SAVE / UPDATE
  // =========================================================

  function validateForm() {
    if (!user) {
      setFormMessage(
        'Unable to determine logged-in location.',
      )

      return false
    }

    if (!rofLoaded) {
      setFormMessage(
        'Load the ROF before saving.',
      )

      return false
    }

    if (!depositDate) {
      setFormMessage(
        'Deposit Date is required.',
      )

      return false
    }

    if (
      !depositReference.trim()
    ) {
      setFormMessage(
        'Deposit Ref# is required.',
      )

      return false
    }

    const amounts = [
      pettyCash,
      bir2307,
      openSales,
      otherDepartmentExpense,
    ]

    if (
      amounts.some(
        (value) =>
          !Number.isFinite(
            value,
          ) ||
          value < 0,
      )
    ) {
      setFormMessage(
        'Amounts cannot be negative or invalid.',
      )

      return false
    }

    if (
      !isEditing &&
      !localFilePath.trim()
    ) {
      setFormMessage(
        'Please select a deposit attachment.',
      )

      return false
    }

    return true
  }

  function requestSave() {
    if (!validateForm()) {
      return
    }

    setShowSaveConfirm(
      true,
    )
  }

  async function saveDeposit() {
    if (!user) {
      return
    }

    setShowSaveConfirm(
      false,
    )

    try {
      setSaving(
        true,
      )

      if (isEditing) {
        const result =
          await window.api.deposit
            .update({
              depositId:
                editingDepositId!,

              locationName:
                user.locationName,

              depositDate,

              depositReference:
                depositReference.trim(),

              pettyCash,

              bir2307,

              openSales,

              otherDepartmentExpense,
            })

        setFormMessage(
          result.message,
        )

        if (result.success) {
          await loadHistory(
            page,
            pageSize,
          )

          setShowFormModal(
            false,
          )
        }

        return
      }

      const result =
        await window.api.deposit
          .create({
            locationName:
              user.locationName,

            businessDate,

            depositDate,

            depositReference:
              depositReference.trim(),

            pettyCash,

            bir2307,

            openSales,

            otherDepartmentExpense,

            localFilePath,
          })

      setFormMessage(
        result.message,
      )

      if (result.success) {
        setPage(
          1,
        )

        await loadHistory(
          1,
          pageSize,
        )

        setShowFormModal(
          false,
        )
      }
    } catch (error) {
      console.error(
        'Unable to save deposit:',
        error,
      )

      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save deposit.',
      )
    } finally {
      setSaving(
        false,
      )
    }
  }

  // =========================================================
  // ATTACHMENT VIEWER
  // =========================================================

  async function openAttachment(
    row: DepositRecord,
  ) {
    if (!row.filename) {
      setHistoryMessage(
        'This deposit has no attachment.',
      )

      return
    }

    setAttachmentTarget(
      row,
    )

    setAttachmentPreview(
      '',
    )

    setAttachmentMessage(
      'Loading attachment...',
    )

    setAttachmentZoom(
      1,
    )

    setAttachmentRotation(
      0,
    )

    try {
      setLoadingAttachment(
        true,
      )

      const result =
        await window.api.deposit
          .getAttachment(
            row.filename,
          )

      setAttachmentMessage(
        result.message,
      )

      if (
        result.success
      ) {
        setAttachmentPreview(
          result.previewDataUrl,
        )
      }
    } catch (error) {
      setAttachmentMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load attachment.',
      )
    } finally {
      setLoadingAttachment(
        false,
      )
    }
  }

  function closeAttachmentViewer() {
    if (
      loadingAttachment ||
      downloadingAttachment ||
      replacingAttachment
    ) {
      return
    }

    setAttachmentTarget(
      null,
    )

    setAttachmentPreview(
      '',
    )

    setAttachmentMessage(
      '',
    )

    setAttachmentZoom(
      1,
    )

    setAttachmentRotation(
      0,
    )
  }

  function zoomAttachmentIn() {
    setAttachmentZoom(
      (current) =>
        Math.min(
          current + 0.25,
          3,
        ),
    )
  }

  function zoomAttachmentOut() {
    setAttachmentZoom(
      (current) =>
        Math.max(
          current - 0.25,
          0.5,
        ),
    )
  }

  function rotateAttachment() {
    setAttachmentRotation(
      (current) =>
        (current + 90) %
        360,
    )
  }

  function resetAttachmentView() {
    setAttachmentZoom(
      1,
    )

    setAttachmentRotation(
      0,
    )
  }

  async function downloadAttachment() {
    if (!attachmentTarget) {
      return
    }

    try {
      setDownloadingAttachment(
        true,
      )

      const result =
        await window.api.deposit
          .downloadAttachment(
            attachmentTarget.filename,
          )

      if (
        !result.canceled
      ) {
        setAttachmentMessage(
          result.message,
        )
      }
    } catch (error) {
      setAttachmentMessage(
        error instanceof Error
          ? error.message
          : 'Unable to download attachment.',
      )
    } finally {
      setDownloadingAttachment(
        false,
      )
    }
  }

  async function replaceAttachment() {
    if (!attachmentTarget) {
      return
    }

    try {
      setReplacingAttachment(
        true,
      )

      setAttachmentMessage(
        'Replacing attachment...',
      )

      const result =
        await window.api.deposit
          .replaceAttachment(
            attachmentTarget.filename,
          )

      if (
        result.canceled
      ) {
        setAttachmentMessage(
          'Replace canceled.',
        )

        return
      }

      setAttachmentMessage(
        result.message,
      )

      if (
        result.success
      ) {
        setAttachmentPreview(
          result.previewDataUrl,
        )
      }
    } catch (error) {
      setAttachmentMessage(
        error instanceof Error
          ? error.message
          : 'Unable to replace attachment.',
      )
    } finally {
      setReplacingAttachment(
        false,
      )
    }
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function deleteDeposit() {
    if (
      !user ||
      !deleteTarget
    ) {
      return
    }

    const targetId =
      deleteTarget.depositId

    setDeleteTarget(
      null,
    )

    try {
      setDeleting(
        true,
      )

      const result =
        await window.api.deposit
          .delete(
            targetId,
            user.locationName,
          )

      setHistoryMessage(
        result.message,
      )

      if (!result.success) {
        return
      }

      if (
        editingDepositId ===
        targetId
      ) {
        setShowFormModal(
          false,
        )

        resetForm()
      }

      if (
        attachmentTarget?.depositId ===
        targetId
      ) {
        setAttachmentTarget(
          null,
        )

        setAttachmentPreview(
          '',
        )

        setAttachmentMessage(
          '',
        )
      }

      const nextPage =
        rows.length === 1 &&
        page > 1
          ? page - 1
          : page

      setPage(
        nextPage,
      )

      await loadHistory(
        nextPage,
        pageSize,
      )
    } catch (error) {
      console.error(
        'Unable to delete deposit:',
        error,
      )

      setHistoryMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete deposit.',
      )
    } finally {
      setDeleting(
        false,
      )
    }
  }

  return (
    <div>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div
        className="
          d-flex
          flex-column
          flex-lg-row
          justify-content-between
          align-items-lg-start
          gap-3
          mb-4
        "
      >
        <div>
          <h1 className="h4 fw-bold mb-2">
            Deposit Monitoring
          </h1>

          <p className="text-secondary mb-0">
            Review deposit history and maintain
            daily cash deposits.
          </p>
        </div>

        <div
          className="
            d-flex
            align-items-center
            gap-2
            flex-wrap
          "
        >
          <span
            className="
              badge
              rounded-pill
              px-3
              py-2
              deposit-location-badge
            "
          >
            {user?.locationName ??
              'Unknown location'}
          </span>

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
              formBusy
            }
            onClick={
              openNewDeposit
            }
          >
            <Plus
              size={18}
            />

            New Deposit
          </button>
        </div>
      </div>

      {/* =====================================================
          DEPOSIT HISTORY
          ===================================================== */}

      <section
        className="
          card
          border
          rounded-4
          overflow-hidden
        "
      >
        <div
          className="
            card-header
            bg-white
            border-bottom
            py-3
          "
        >
          <div
            className="
              d-flex
              flex-column
              flex-xl-row
              justify-content-between
              align-items-xl-center
              gap-3
            "
          >
            <div>
              <h2 className="h6 fw-bold mb-1">
                Deposit History
              </h2>

              <p className="small text-secondary mb-0">
                Search, review, view attachments,
                edit, or delete previously saved
                deposits.
              </p>
            </div>

            <span
              className="
                badge
                rounded-pill
                deposit-location-badge
                align-self-start
                align-self-xl-center
              "
            >
              {totalRecords}{' '}
              record
              {totalRecords ===
              1
                ? ''
                : 's'}
            </span>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-12 col-lg-5">
              <div className="input-group">
                <span className="input-group-text">
                  <Search
                    size={16}
                  />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search ID, reference, filename, amount..."
                  value={
                    keyword
                  }
                  onChange={(
                    event,
                  ) =>
                    setKeyword(
                      event.target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      void applyFilters()
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <select
                className="form-select"
                value={
                  month
                }
                onChange={(
                  event,
                ) =>
                  setMonth(
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  All Months
                </option>

                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map(
                  (
                    name,
                    index,
                  ) => (
                    <option
                      key={
                        name
                      }
                      value={
                        index + 1
                      }
                    >
                      {name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <input
                type="number"
                className="form-control"
                min="2000"
                max="2100"
                placeholder="Year"
                value={
                  year
                }
                onChange={(
                  event,
                ) =>
                  setYear(
                    event.target
                      .value,
                  )
                }
              />
            </div>

            <div className="col-12 col-md-auto">
              <button
                type="button"
                className="
                  btn
                  btn-outline-secondary
                  d-flex
                  align-items-center
                  justify-content-center
                  gap-2
                  w-100
                "
                disabled={
                  loadingHistory
                }
                onClick={() =>
                  void applyFilters()
                }
              >
                <RefreshCw
                  size={16}
                  className={
                    loadingHistory
                      ? 'spin'
                      : ''
                  }
                />

                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 pt-3">
          <div
            className={`alert ${historyMessageClass} py-2 px-3 small mb-0`}
            role="status"
          >
            {historyMessage}
          </div>
        </div>

        <div className="table-responsive">
          <table
            className="
              table
              table-hover
              align-middle
              mb-0
              small
              deposit-history-table
            "
          >
            <thead className="table-light">
 <tr>
  <th className="text-center">Actions</th>
  <th>ID</th>
  <th>Business Date</th>
  <th>Deposit Date</th>
  <th>Reference</th>
  <th className="text-center">POS</th>
  <th className="text-center">Deposit</th>
  <th className="text-end">Petty Cash</th>
  <th className="text-end">BIR 2307</th>
  <th className="text-end">Open Sales</th>
  <th className="text-end">Other Expense</th>
  <th className="text-end">Variance</th>
  <th>Filename</th>
</tr>
            </thead>

            <tbody>
              {loadingHistory ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-5"
                  >
                    <span
                      className="
                        spinner-border
                        spinner-border-sm
                        text-primary
                        me-2
                      "
                    />

                    Loading deposits...
                  </td>
                </tr>
              ) : rows.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="
                      text-center
                      text-secondary
                      py-5
                    "
                  >
                    No deposit records found.
                  </td>
                </tr>
              ) : (
                rows.map(
                  (row) => (
                    <tr
                      key={
                        row.depositId
                      }
                    >
                       <td>
                        <div
                          className="
                            d-flex
                            justify-content-end
                            gap-1
                          "
                        >
                          <button
                            type="button"
                            className="
                              btn
                              btn-sm
                              btn-outline-secondary
                            "
                            title="View attachment"
                            disabled={
                              !row.filename ||
                              loadingAttachment ||
                              deleting
                            }
                            onClick={() =>
                              void openAttachment(
                                row,
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="
                              btn
                              btn-sm
                              btn-outline-secondary
                            "
                            title="Edit deposit"
                            disabled={
                              loadingRecord ||
                              deleting
                            }
                            onClick={() =>
                              void editFromHistory(
                                row,
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="
                              btn
                              btn-sm
                              btn-outline-danger
                            "
                            title="Delete deposit"
                            disabled={
                              loadingRecord ||
                              deleting
                            }
                            onClick={() =>
                              setDeleteTarget(
                                row,
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>

                      <td className="fw-semibold">
                        #{row.depositId}
                      </td>

                      <td>
                        {formatDate(
                          row.businessDate,
                        )}
                      </td>

                      <td>
                        {formatDate(
                          row.depositDate,
                        )}
                      </td>

                      <td>
                        {row.depositReference ||
                          '—'}
                      </td>

                      <MoneyCell
                        value={
                          row.posAmount
                        }
                      />

                      <MoneyCell
                        value={
                          row.depositAmount
                        }
                      />

                      <MoneyCell
                        value={
                          row.pettyCash
                        }
                      />

                      <MoneyCell
                        value={
                          row.bir2307
                        }
                      />

                      <MoneyCell
                        value={
                          row.openSales
                        }
                      />

                      <MoneyCell
                        value={
                          row.otherDepartmentExpense
                        }
                      />

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

                      <td
                        className="text-truncate"
                        style={{
                          maxWidth:
                            180,
                        }}
                        title={
                          row.filename
                        }
                      >
                        {row.filename ||
                          '—'}
                      </td>

                     
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        <div
          className="
            card-footer
            bg-white
            border-top
            d-flex
            flex-column
            flex-sm-row
            align-items-sm-center
            justify-content-between
            gap-3
            py-3
          "
        >
          <div
            className="
              d-flex
              align-items-center
              gap-2
              small
              text-secondary
            "
          >
            <span>
              Rows per page
            </span>

            <select
              className="
                form-select
                form-select-sm
                deposit-page-size
              "
              value={
                pageSize
              }
              disabled={
                loadingHistory
              }
              onChange={(
                event,
              ) =>
                void changePageSize(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="
              d-flex
              align-items-center
              gap-2
            "
          >
            <span className="small text-secondary">
              Page{' '}
              {totalPages ===
              0
                ? 0
                : page}{' '}
              of{' '}
              {totalPages}
            </span>

            <button
              type="button"
              className="
                btn
                btn-sm
                btn-outline-secondary
              "
              disabled={
                page <= 1 ||
                loadingHistory
              }
              onClick={() =>
                void changePage(
                  page - 1,
                )
              }
            >
              <ChevronLeft
                size={16}
              />
            </button>

            <button
              type="button"
              className="
                btn
                btn-sm
                btn-outline-secondary
              "
              disabled={
                page >=
                  totalPages ||
                totalPages ===
                  0 ||
                loadingHistory
              }
              onClick={() =>
                void changePage(
                  page + 1,
                )
              }
            >
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          NEW / EDIT MODAL
          ===================================================== */}

      {showFormModal && (
        <>
          <div
            className="
              modal
              fade
              show
              d-block
            "
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
              zIndex: 1055,
            }}
          >
            <div
              className="
                modal-dialog
                modal-xl
                modal-dialog-centered
                modal-dialog-scrollable
              "
            >
              <div className="modal-content border-0 shadow">

                <div
                  className="
                    modal-header
                    align-items-start
                  "
                >
                  <div>
                    <h2 className="modal-title h5 fw-bold mb-1">
                      {isEditing
                        ? `Edit Deposit #${editingDepositId}`
                        : 'New Deposit'}
                    </h2>

                    <p className="small text-secondary mb-0">
                      {isEditing
                        ? 'Update the editable deposit information below.'
                        : 'Load a finalized ROF, then enter the deposit information.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="
                      btn
                      btn-sm
                      btn-light
                      border
                      rounded-circle
                      p-2
                      d-flex
                    "
                    aria-label="Close"
                    disabled={
                      formBusy
                    }
                    onClick={
                      closeFormModal
                    }
                  >
                    <X
                      size={18}
                    />
                  </button>
                </div>

                <div className="modal-body">

                  <div className="row g-3 align-items-end mb-4">
                    <div className="col-12 col-md-5 col-xl-4">
                      <label
                        htmlFor="deposit-business-date"
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
                        id="deposit-business-date"
                        type="date"
                        className="form-control"
                        value={
                          businessDate
                        }
                        max={
                          todayString()
                        }
                        disabled={
                          formBusy ||
                          isEditing
                        }
                        onChange={(
                          event,
                        ) => {
                          setBusinessDate(
                            event.target
                              .value,
                          )

                          setPosAmount(
                            0,
                          )

                          setDepositAmount(
                            0,
                          )

                          setRofLoaded(
                            false,
                          )

                          setLocalFilePath(
                            '',
                          )

                          setFilename(
                            '',
                          )

                          setPreviewDataUrl(
                            '',
                          )

                          setFormMessage(
                            'Click Load ROF to continue.',
                          )
                        }}
                      />
                    </div>

                    {!isEditing && (
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
                            loadingRof ||
                            !businessDate
                          }
                          onClick={
                            loadRof
                          }
                        >
                          <RefreshCw
                            size={17}
                            className={
                              loadingRof
                                ? 'spin'
                                : ''
                            }
                          />

                          Load ROF
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                      <DepositMetric
                        icon={
                          <WalletCards
                            size={19}
                          />
                        }
                        label="ROF POS Amount"
                        value={
                          posAmount
                        }
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <DepositMetric
                        icon={
                          <Banknote
                            size={19}
                          />
                        }
                        label="ROF Actual Cash"
                        value={
                          depositAmount
                        }
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <DepositMetric
                        icon={
                          <WalletCards
                            size={19}
                          />
                        }
                        label="Current Variance"
                        value={
                          variance
                        }
                        variance
                      />
                    </div>
                  </div>

                  <div
                    className={`alert ${formMessageClass} py-2 px-3 small fw-medium`}
                    role="alert"
                  >
                    {formMessage}
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6 col-xl-4">
                      <label
                        htmlFor="deposit-date"
                        className="form-label fw-semibold small"
                      >
                        Deposit Date
                      </label>

                      <input
                        id="deposit-date"
                        type="date"
                        className="form-control"
                        value={
                          depositDate
                        }
                        disabled={
                          !rofLoaded ||
                          formBusy
                        }
                        onChange={(
                          event,
                        ) =>
                          setDepositDate(
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                      <label
                        htmlFor="deposit-reference"
                        className="form-label fw-semibold small"
                      >
                        Deposit Ref#
                      </label>

                      <input
                        id="deposit-reference"
                        type="text"
                        className="form-control"
                        placeholder="Enter bank/reference number"
                        value={
                          depositReference
                        }
                        disabled={
                          !rofLoaded ||
                          formBusy
                        }
                        onChange={(
                          event,
                        ) =>
                          setDepositReference(
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="col-12 col-xl-4">
                      <label
                        className="form-label fw-semibold small"
                      >
                        Deposit Attachment
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <FileText
                            size={16}
                          />
                        </span>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            filename
                          }
                          placeholder="No file selected"
                          readOnly
                          disabled={
                            isEditing
                          }
                        />

                        {!isEditing && (
                          <button
                            type="button"
                            className="
                              btn
                              btn-outline-secondary
                              d-flex
                              align-items-center
                              gap-2
                            "
                            disabled={
                              !rofLoaded ||
                              formBusy
                            }
                            onClick={() =>
                              void browseAttachment()
                            }
                          >
                            <Upload
                              size={16}
                            />

                            Browse
                          </button>
                        )}
                      </div>

                      {previewDataUrl &&
                        !isEditing && (
                          <div
                            className="
                              border
                              rounded-3
                              mt-2
                              p-2
                              bg-light
                            "
                          >
                            <img
                              src={
                                previewDataUrl
                              }
                              alt="Deposit attachment preview"
                              className="
                                img-fluid
                                rounded-2
                                d-block
                                mx-auto
                              "
                              style={{
                                maxHeight:
                                  220,
                                objectFit:
                                  'contain',
                              }}
                            />
                          </div>
                        )}

                      {isEditing &&
                        filename && (
                          <div className="form-text">
                            Existing attachment:{' '}
                            {filename}
                          </div>
                        )}
                    </div>

                    <AmountField
                      id="deposit-petty-cash"
                      label="Petty Cash"
                      value={
                        pettyCash
                      }
                      disabled={
                        !rofLoaded ||
                        formBusy
                      }
                      onChange={
                        setPettyCash
                      }
                    />

                    <AmountField
                      id="deposit-bir-2307"
                      label="BIR 2307"
                      value={
                        bir2307
                      }
                      disabled={
                        !rofLoaded ||
                        formBusy
                      }
                      onChange={
                        setBir2307
                      }
                    />

                    <AmountField
                      id="deposit-open-sales"
                      label="Open Sales"
                      value={
                        openSales
                      }
                      disabled={
                        !rofLoaded ||
                        formBusy
                      }
                      onChange={
                        setOpenSales
                      }
                    />

                    <AmountField
                      id="deposit-other-expense"
                      label="Other Department Expense"
                      value={
                        otherDepartmentExpense
                      }
                      disabled={
                        !rofLoaded ||
                        formBusy
                      }
                      onChange={
                        setOtherDepartmentExpense
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  {isEditing && (
                    <button
                      type="button"
                      className="
                        btn
                        btn-outline-danger
                        me-auto
                        d-flex
                        align-items-center
                        gap-2
                      "
                      disabled={
                        formBusy
                      }
                      onClick={() => {
                        const current =
                          rows.find(
                            (row) =>
                              row.depositId ===
                              editingDepositId,
                          )

                        if (current) {
                          setDeleteTarget(
                            current,
                          )
                        }
                      }}
                    >
                      <Trash2
                        size={17}
                      />

                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={
                      formBusy
                    }
                    onClick={
                      closeFormModal
                    }
                  >
                    Cancel
                  </button>

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
                      !rofLoaded ||
                      formBusy
                    }
                    onClick={
                      requestSave
                    }
                  >
                    <Save
                      size={17}
                    />

                    {saving
                      ? isEditing
                        ? 'Updating...'
                        : 'Saving...'
                      : isEditing
                        ? 'Update Deposit'
                        : 'Save Deposit'}
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div
            className="
              modal-backdrop
              fade
              show
            "
            style={{
              zIndex: 1050,
            }}
          />
        </>
      )}

      {/* =====================================================
          ATTACHMENT VIEWER MODAL
          ===================================================== */}

      {attachmentTarget && (
        <>
          <div
            className="
              modal
              fade
              show
              d-block
            "
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
              zIndex: 1065,
            }}
          >
            <div
              className="
                modal-dialog
                modal-lg
                modal-dialog-centered
                modal-dialog-scrollable
              "
            >
              <div
                className="
                  modal-content
                  border-0
                  shadow
                "
              >
                <div className="modal-header">
                  <div>
                    <h2
                      className="
                        modal-title
                        h5
                        fw-bold
                        mb-1
                        d-flex
                        align-items-center
                        gap-2
                      "
                    >
                      <ImageIcon
                        size={20}
                      />

                      Deposit Attachment
                    </h2>

                    <div className="small text-secondary">
                      Deposit #{attachmentTarget.depositId}
                      {' · '}
                      {attachmentTarget.filename}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="
                      btn
                      btn-sm
                      btn-light
                      border
                      rounded-circle
                      p-2
                      d-flex
                    "
                    aria-label="Close"
                    disabled={
                      loadingAttachment ||
                      downloadingAttachment ||
                      replacingAttachment
                    }
                    onClick={
                      closeAttachmentViewer
                    }
                  >
                    <X
                      size={18}
                    />
                  </button>
                </div>

                <div className="modal-body">
                  <div
                    className="
                      border
                      rounded-4
                      bg-light
                      d-flex
                      align-items-center
                      justify-content-center
                      overflow-auto
                      position-relative
                    "
                    style={{
                      minHeight:
                        380,
                      maxHeight:
                        '68vh',
                    }}
                  >
                    {loadingAttachment ? (
                      <div
                        className="
                          text-center
                          text-secondary
                          py-5
                        "
                      >
                        <span
                          className="
                            spinner-border
                            text-primary
                            mb-3
                          "
                        />

                        <div>
                          Loading image from FTP...
                        </div>
                      </div>
                    ) : attachmentPreview ? (
                      <img
                        src={
                          attachmentPreview
                        }
                        alt={
                          attachmentTarget.filename
                        }
                        className="
                          img-fluid
                          d-block
                          mx-auto
                        "
                        style={{
                          maxHeight:
                            '65vh',
                          maxWidth:
                            '100%',
                          objectFit:
                            'contain',
                          transform:
                            `scale(${attachmentZoom}) rotate(${attachmentRotation}deg)`,
                          transformOrigin:
                            'center center',
                          transition:
                            'transform 180ms ease',
                        }}
                      />
                    ) : (
                      <div
                        className="
                          text-center
                          text-secondary
                          p-5
                        "
                      >
                        <ImageIcon
                          size={42}
                          className="mb-3"
                        />

                        <div>
                          Unable to display the attachment.
                        </div>
                      </div>
                    )}
                  </div>

                  {attachmentPreview && !loadingAttachment && (
                    <div
                      className="
                        d-flex
                        flex-wrap
                        align-items-center
                        justify-content-center
                        gap-2
                        mt-3
                      "
                    >
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={zoomAttachmentOut}
                        disabled={
                          attachmentZoom <= 0.5 ||
                          replacingAttachment ||
                          downloadingAttachment
                        }
                      >
                        <ZoomOut size={16} />
                        Zoom Out
                      </button>

                      <span
                        className="
                          badge
                          text-bg-light
                          border
                          px-3
                          py-2
                        "
                      >
                        {Math.round(
                          attachmentZoom * 100,
                        )}%
                      </span>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={zoomAttachmentIn}
                        disabled={
                          attachmentZoom >= 3 ||
                          replacingAttachment ||
                          downloadingAttachment
                        }
                      >
                        <ZoomIn size={16} />
                        Zoom In
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={rotateAttachment}
                        disabled={
                          replacingAttachment ||
                          downloadingAttachment
                        }
                      >
                        <RotateCw size={16} />
                        Rotate
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={resetAttachmentView}
                        disabled={
                          replacingAttachment ||
                          downloadingAttachment
                        }
                      >
                        Reset View
                      </button>
                    </div>
                  )}

                  {attachmentMessage && (
                    <div
                      className={`alert ${getNoticeClass(
                        attachmentMessage,
                      )} small mt-3 mb-0`}
                      role="status"
                    >
                      {attachmentMessage}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="
                      btn
                      btn-outline-secondary
                    "
                    disabled={
                      loadingAttachment ||
                      downloadingAttachment ||
                      replacingAttachment
                    }
                    onClick={
                      closeAttachmentViewer
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="
                      btn
                      btn-outline-secondary
                      d-flex
                      align-items-center
                      gap-2
                    "
                    disabled={
                      loadingAttachment ||
                      downloadingAttachment ||
                      replacingAttachment ||
                      !attachmentPreview
                    }
                    onClick={() =>
                      void downloadAttachment()
                    }
                  >
                    {downloadingAttachment ? (
                      <span
                        className="
                          spinner-border
                          spinner-border-sm
                        "
                      />
                    ) : (
                      <Download
                        size={17}
                      />
                    )}

                    Download
                  </button>

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
                      loadingAttachment ||
                      downloadingAttachment ||
                      replacingAttachment
                    }
                    onClick={() =>
                      void replaceAttachment()
                    }
                  >
                    {replacingAttachment ? (
                      <span
                        className="
                          spinner-border
                          spinner-border-sm
                        "
                      />
                    ) : (
                      <Upload
                        size={17}
                      />
                    )}

                    Replace Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="
              modal-backdrop
              fade
              show
            "
            style={{
              zIndex: 1060,
            }}
          />
        </>
      )}

      {(saving || deleting || loadingRof) && (
        <BusyOverlay
          message={
            busyOverlayMessage
          }
        />
      )}

      {/* =====================================================
          CONFIRM DIALOGS
          ===================================================== */}

      <ConfirmDialog
        open={
          showSaveConfirm
        }
        title={
          isEditing
            ? 'Update Deposit?'
            : 'Save Deposit?'
        }
        message={
          isEditing
            ? `Update Deposit #${editingDepositId} for ${formatDate(
                businessDate,
              )}?`
            : `Save the deposit for ${formatDate(
                businessDate,
              )}? The ROF cash totals will be revalidated before saving.`
        }
        confirmText={
          isEditing
            ? 'Update Deposit'
            : 'Save Deposit'
        }
        cancelText="Cancel"
        onConfirm={() => {
          void saveDeposit()
        }}
        onCancel={() =>
          setShowSaveConfirm(
            false,
          )
        }
      />

      <ConfirmDialog
        open={
          deleteTarget !==
          null
        }
        title="Delete Deposit?"
        message={
          deleteTarget
            ? `Deposit #${deleteTarget.depositId} for ${formatDate(
                deleteTarget.businessDate,
              )} will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmText="Delete Deposit"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          void deleteDeposit()
        }}
        onCancel={() =>
          setDeleteTarget(
            null,
          )
        }
      />
    </div>
  )
}

function getNoticeClass(
  message: string,
) {
  const normalized =
    message.toLowerCase()

  if (
    normalized.includes(
      'success',
    ) ||
    normalized.includes(
      'loaded successfully',
    ) ||
    normalized.includes(
      'selected successfully',
    ) ||
    normalized.includes(
      'saved successfully',
    ) ||
    normalized.includes(
      'updated successfully',
    ) ||
    normalized.includes(
      'downloaded successfully',
    ) ||
    normalized.includes(
      'replaced successfully',
    )
  ) {
    return 'alert-success'
  }

  if (
    normalized.includes(
      'already',
    ) ||
    normalized.includes(
      'cancel',
    ) ||
    normalized.includes(
      'warning',
    ) ||
    normalized.includes(
      'editing',
    ) ||
    normalized.includes(
      'select a business date',
    ) ||
    normalized.includes(
      'click load rof',
    )
  ) {
    return 'alert-warning'
  }

  if (
    normalized.includes(
      'required',
    ) ||
    normalized.includes(
      'invalid',
    ) ||
    normalized.includes(
      'unable',
    ) ||
    normalized.includes(
      'failed',
    ) ||
    normalized.includes(
      'cannot',
    ) ||
    normalized.includes(
      'no rof',
    ) ||
    normalized.includes(
      'not found',
    ) ||
    normalized.includes(
      'must',
    )
  ) {
    return 'alert-danger'
  }

  return 'alert-info'
}

function BusyOverlay({
  message,
}: {
  message: string
}) {
  return (
    <div
      className="
        position-fixed
        top-0
        start-0
        w-100
        h-100
        d-flex
        align-items-center
        justify-content-center
      "
      style={{
        background:
          'rgba(255, 255, 255, 0.78)',
        backdropFilter:
          'blur(2px)',
        zIndex: 1100,
      }}
      aria-live="assertive"
      aria-busy="true"
    >
      <div
        className="
          bg-white
          border
          rounded-4
          shadow
          px-5
          py-4
          text-center
        "
        style={{
          minWidth: 260,
        }}
      >
        <div
          className="
            spinner-border
            text-primary
            mb-3
          "
          style={{
            width: '2.75rem',
            height: '2.75rem',
          }}
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <div className="fw-semibold">
          {message}
        </div>

        <div className="small text-secondary mt-1">
          Please wait while the operation completes.
        </div>
      </div>
    </div>
  )
}

interface DepositMetricProps {
  icon: ReactNode
  label: string
  value: number
  variance?: boolean
}

function DepositMetric({
  icon,
  label,
  value,
  variance = false,
}: DepositMetricProps) {
  const valueClass =
    !variance ||
    value === 0
      ? ''
      : value > 0
        ? 'text-warning'
        : 'text-danger'

  return (
    <div
      className="
        border
        rounded-4
        p-3
        h-100
        bg-light
      "
    >
      <div
        className="
          d-flex
          align-items-center
          gap-2
          text-secondary
          small
          mb-2
        "
      >
        <span className="deposit-metric-icon">
          {icon}
        </span>

        {label}
      </div>

      <div
        className={`fs-5 fw-bold ${valueClass}`}
      >
        ₱
        {formatMoney(
          value,
        )}
      </div>
    </div>
  )
}

interface AmountFieldProps {
  id: string
  label: string
  value: number
  disabled: boolean
  onChange: (
    value: number,
  ) => void
}

function AmountField({
  id,
  label,
  value,
  disabled,
  onChange,
}: AmountFieldProps) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <label
        htmlFor={id}
        className="form-label fw-semibold small"
      >
        {label}
      </label>

      <div className="input-group">
        <span className="input-group-text">
          ₱
        </span>

        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          className="form-control text-end"
          placeholder="0.00"
          value={
            value === 0
              ? ''
              : value
          }
          disabled={
            disabled
          }
          onChange={(
            event,
          ) =>
            onChange(
              toNumber(
                event.target
                  .value,
              ),
            )
          }
        />
      </div>
    </div>
  )
}

function MoneyCell({
  value,
}: {
  value: number
}) {
  return (
    <td className="text-end">
      ₱
      {formatMoney(
        value,
      )}
    </td>
  )
}

export default DepositPage
