interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }

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
        bg-dark
        bg-opacity-50
        p-3
      "
      style={{
        zIndex: 1055,
      }}
      onClick={onCancel}
    >
      <div
        className="
          bg-white
          rounded-4
          shadow
          border
          w-100
          overflow-hidden
        "
        style={{
          maxWidth: '430px',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="p-4">
          <h2
            id="confirm-dialog-title"
            className="h5 fw-bold mb-2"
          >
            {title}
          </h2>

          <p className="text-secondary mb-0">
            {message}
          </p>
        </div>

        <div
          className="
            border-top
            bg-light
            px-4
            py-3
            d-flex
            justify-content-end
            gap-2
          "
        >
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={
              variant === 'danger'
                ? 'btn btn-danger'
                : 'btn btn-primary'
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog