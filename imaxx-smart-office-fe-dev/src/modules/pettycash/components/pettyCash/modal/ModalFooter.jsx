import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons'
import { faPrint, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '../../../i18n'

function FooterButton({ children, className = '', onClick }) {
  const hasExplicitBorder = className.includes('border ')
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-8 sm:px-4 ${className}`}
      style={{ boxShadow: 'none', border: hasExplicitBorder ? undefined : 'none' }}
    >
      {children}
    </button>
  )
}

export default function ModalFooter({
  status,
  isCreate,
  isResendEdit = false,
  isTask,
  onClose,
  onAction,
  onDownloadPdf,
  totalAmount,
  canSave = true,
  canSubmit = true,
  canApprove = true,
  canReject = true,
  canCancel = true,
  canResend = true,
  canExport = true,
}) {
  const { t } = useI18n()
  const isCompleted = status === 'Completed'
  const isRejected = status === 'Rejected'
  const isCancelled = status === 'Cancelled' || status === 'Canceled'

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-3.5 py-2 shadow-[0_-4px_16px_rgba(15,23,42,0.04)] sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-2.5">
      <div className="mb-2 flex min-w-0 items-center gap-3 sm:mb-0">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('totalAmount')}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary sm:text-2xl">{totalAmount ? totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
            <span className="text-sm font-semibold text-slate-400">฿</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
        {isCreate ? (
          <>
            <FooterButton onClick={onClose} className="text-slate-500 hover:bg-slate-100">{t('cancel')}</FooterButton>
            {!isResendEdit && canSave ? <FooterButton onClick={() => onAction('draft')} className="border border-slate-200 text-slate-500 hover:bg-slate-50">{t('draft')}</FooterButton> : null}
            {(isResendEdit ? canResend : canSubmit) ? (
              <FooterButton onClick={() => onAction('submit')} className="border-0 bg-primary text-white hover:bg-primary-700">
                <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
                {isResendEdit ? t('resend') : t('submit')}
              </FooterButton>
            ) : null}
          </>
        ) : isTask ? (
          <>
            <FooterButton onClick={onClose} className="border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-24">{t('close')}</FooterButton>
            {canReject ? <FooterButton onClick={() => onAction('reject')} className="border-0 bg-danger text-white hover:bg-danger-600 sm:w-24">{t('reject')}</FooterButton> : null}
            {canApprove ? <FooterButton onClick={() => onAction('approve')} className="border-0 bg-success text-white hover:bg-success-hover sm:w-24">{t('approve')}</FooterButton> : null}
          </>
        ) : isCompleted ? (
          <>
            <FooterButton onClick={onClose} className="border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-28">{t('close')}</FooterButton>
            {canExport ? (
              <FooterButton onClick={onDownloadPdf} className="col-span-2 border-0 bg-primary-700 text-white hover:bg-primary-950 sm:w-40">
                <FontAwesomeIcon icon={faPrint} className="h-4 w-4" />
                {t('downloadPdf')}
              </FooterButton>
            ) : null}
          </>
        ) : isRejected ? (
          <>
            {canCancel ? <FooterButton onClick={() => onAction('cancel')} className="border-0 bg-danger text-white hover:bg-danger-600 sm:w-28">{t('cancelRequest')}</FooterButton> : null}
            {canResend ? (
              <FooterButton onClick={() => onAction('resend')} className="col-span-2 border-0 bg-warning text-white hover:opacity-90 sm:w-40">
                <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
                {t('resend')}
              </FooterButton>
            ) : null}
          </>
        ) : isCancelled ? (
          <FooterButton onClick={onClose} className="col-span-3 border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-28">{t('close')}</FooterButton>
        ) : (
          <FooterButton onClick={onClose} className="col-span-3 border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-28">{t('close')}</FooterButton>
        )}
      </div>
    </div>
  )
}
