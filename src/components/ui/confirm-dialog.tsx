import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, the confirm button uses the destructive (red) style. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * In-app confirmation dialog built on the shared Modal. Replaces the native
 * browser `confirm()` so destructive actions stay on-brand and can't be
 * silently suppressed by the browser's "don't ask again" option.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="confirm-dialog-title" className="max-w-sm">
      <div className="p-7">
        <h2
          id="confirm-dialog-title"
          className="font-serif text-2xl leading-tight text-teal-deep"
        >
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-6 text-teal/65">{description}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? "flex-1 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                : "flex-1 rounded-full bg-teal-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal disabled:opacity-50"
            }
          >
            {loading ? "Lütfen bekleyin..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-teal/20 px-6 py-3 text-sm font-semibold text-teal transition hover:bg-foam disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
