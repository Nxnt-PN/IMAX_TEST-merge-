import React, { useState } from 'react'
import { useI18n } from '../../i18n'

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'bg-blue-600 hover:bg-blue-700',
  icon,
  showReason = false,
  reasonLabel,
  onConfirm,
  onCancel
}) {
  const { t } = useI18n()
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (showReason) {
      onConfirm(reason)
    } else {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/40 px-4 py-5">
      <div className="max-h-[calc(100dvh-40px)] w-full max-w-[420px] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col items-center text-center">
          {icon && <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">{icon}</div>}
          <h3 className="mb-2 text-lg font-bold leading-6 text-slate-900">{title}</h3>
          <p className="max-w-[320px] text-sm leading-5 text-slate-500">{message}</p>
        </div>

        {showReason && (
          <div className="mt-4 text-left">
            <label className="mb-1 block text-xs font-semibold text-slate-700">{reasonLabel || t('rejectReason')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[76px] w-full resize-y rounded-md border border-slate-300 p-2.5 text-sm leading-5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              rows={2}
              placeholder={t('reasonPlaceholder')}
            />
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold leading-5 text-slate-700 shadow-none hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {cancelText || t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`min-h-[44px] rounded-md border-0 px-3 py-2 text-sm font-semibold leading-5 text-white shadow-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${confirmColor}`}
          >
            {confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
