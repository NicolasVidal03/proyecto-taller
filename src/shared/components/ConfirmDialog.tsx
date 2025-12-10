import React from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  disabled = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="bg-brand-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="px-6 py-6">
          {description ? <p className="text-sm text-lead-600 leading-relaxed">{description}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors"
              disabled={disabled}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 transition-all"
              disabled={disabled}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
