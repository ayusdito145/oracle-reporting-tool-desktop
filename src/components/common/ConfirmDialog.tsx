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
      className="dialog-overlay"
      onClick={onCancel}
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="confirm-dialog-content">
          <h2 id="confirm-dialog-title">
            {title}
          </h2>

          <p>{message}</p>
        </div>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="dialog-button dialog-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

<button
  type="button"
  className={`dialog-button ${
    variant === 'danger'
      ? 'dialog-button-danger'
      : 'dialog-button-confirm'
  }`}
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