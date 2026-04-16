"use client";

interface ConfirmDialogProps {
  message: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, title = "Confirm action", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative bg-card rounded-xl shadow-lg border border-border p-6 max-w-sm w-full mx-4">
        <h2 id="confirm-dialog-title" className="sr-only">{title}</h2>
        <p className="text-foreground text-sm mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-label bg-card border border-input rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
