import { CheckCircle, Clock, FileText, RotateCw, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../../i18n'

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actorName = (history) => {
  const user = history.user || history.User
  return user?.name || [user?.first_name || user?.FirstName, user?.last_name || user?.LastName].filter(Boolean).join(' ') || '-'
}

const actionIcon = (action) => {
  const normalized = String(action || '').toLowerCase()
  if (normalized.includes('reject') || normalized.includes('cancel')) return XCircle
  if (normalized.includes('approve') || normalized.includes('complete')) return CheckCircle
  if (normalized.includes('resend')) return RotateCw
  if (normalized.includes('submit') || normalized.includes('create')) return FileText
  return Clock
}

const actionTone = (action) => {
  const normalized = String(action || '').toLowerCase()
  if (normalized.includes('reject') || normalized.includes('cancel')) return 'bg-danger text-white'
  if (normalized.includes('approve') || normalized.includes('complete')) return 'bg-success text-white'
  if (normalized.includes('resend')) return 'bg-primary text-white'
  return 'bg-warning text-dark'
}

export default function ActivityHistory({ history = [], drawer = false, isOpen = true, onClose }) {
  const { t, tAction } = useI18n()
  const [showAll, setShowAll] = useState(false)
  const sortedHistory = [...history].sort((a, b) => new Date(b.created_at || b.CreatedAt) - new Date(a.created_at || a.CreatedAt))
  const visibleHistory = showAll ? sortedHistory : sortedHistory.slice(0, 5)

  if (drawer && !isOpen) return null
  if (sortedHistory.length === 0 && !drawer) return null

  const content = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{t('activityHistory')}</h3>
        <div className="flex items-center gap-3">
          {sortedHistory.length > 5 ? (
            <button type="button" onClick={() => setShowAll((value) => !value)} className="border-0 bg-transparent text-xs font-semibold text-primary shadow-none hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
              {showAll ? t('showLess') : t('showAll')}
            </button>
          ) : null}
          {drawer ? (
            <button type="button" onClick={onClose} className="rounded-md border-0 bg-transparent p-1 text-slate-400 shadow-none hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      {sortedHistory.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
          {t('noActivityHistory')}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleHistory.map((item, index) => {
            const action = item.action || item.Action || 'Action'
            const remark = item.remark || item.Remark
            const Icon = actionIcon(action)
            return (
              <div key={item.id || item.ID || `${action}-${index}`} className="flex gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${actionTone(action)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800">{tAction(action)}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(item.created_at || item.CreatedAt)}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{t('by')} {actorName(item)}</p>
                  {remark ? <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{remark}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  if (drawer) {
    return (
      <div className="fixed inset-0 z-[10010]">
        <button type="button" className="absolute inset-0 border-0 bg-black/20 shadow-none focus:outline-none" onClick={onClose} aria-label="Close history drawer" />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-[-16px_0_48px_rgba(15,23,42,0.22)]">
          {content}
        </aside>
      </div>
    )
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_8px_rgba(15,23,42,0.05)]">
      {content}
    </section>
  )
}
