import { MessageSquare } from 'lucide-react'
import { useI18n } from '../../../i18n'

const formatDateTime = (value, locale) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RejectComment({ comment, rejectedAt, rejectedBy }) {
  const { t, language } = useI18n()
  const locale = language === 'th' ? 'th-TH' : 'en-US'

  return (
    <div className="rounded-2xl border border-red-100 px-3.5 py-3 text-red-700 sm:px-7 sm:py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">{t('rejectCommentTitle')}</span>
        <span className="text-xs font-medium text-red-400">{formatDateTime(rejectedAt, locale)}</span>
      </div>
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="border-b border-red-200 pb-3 text-sm font-semibold leading-relaxed text-red-800">
            {comment || t('noRejectComment')}
          </p>
          <p className="mt-3 text-xs font-semibold text-red-500">{t('rejectedByApprover')}: {rejectedBy || '-'}</p>
        </div>
      </div>
    </div>
  )
}
