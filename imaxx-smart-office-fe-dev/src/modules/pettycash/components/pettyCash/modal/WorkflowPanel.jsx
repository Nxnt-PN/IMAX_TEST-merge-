import { Check, Clock, FileText, RotateCw, X } from 'lucide-react'
import { currentLocation } from './workflow'
import { useI18n } from '../../../i18n'

const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
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
  if (normalized.includes('reject') || normalized.includes('cancel')) return X
  if (normalized.includes('resend')) return RotateCw
  if (normalized.includes('submit') || normalized.includes('create')) return FileText
  if (normalized.includes('approve') || normalized.includes('complete')) return Check
  return Clock
}

const actionTone = (action) => {
  const normalized = String(action || '').toLowerCase()
  if (normalized.includes('reject') || normalized.includes('cancel')) return 'bg-danger text-white'
  if (normalized.includes('approve') || normalized.includes('complete')) return 'bg-success text-white'
  if (normalized.includes('resend')) return 'bg-primary text-white'
  return 'bg-warning text-dark'
}

export default function WorkflowPanel({ status, theme, history = [], stateDetail, currentRole, roleName }) {
  const { t, tStatus, tAction } = useI18n()
  const color = theme === 'green' ? 'bg-success text-white' : theme === 'red' ? 'bg-danger text-white' : theme === 'yellow' ? 'bg-warning text-dark' : 'bg-secondary text-white'
  const sortedHistory = [...history].sort((a, b) => new Date(a.created_at || a.CreatedAt) - new Date(b.created_at || b.CreatedAt))
  const latestAction = sortedHistory[sortedHistory.length - 1]?.action || sortedHistory[sortedHistory.length - 1]?.Action

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm sm:px-7 sm:py-6">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-6">
        <span className={`inline-flex h-7 min-w-[140px] items-center justify-center rounded-full px-4 text-xs font-bold ${color}`}>
          {tStatus(status || 'Draft')}
        </span>
        <p className="text-sm text-slate-500">
          {t('currentLocation')}: <span className="font-semibold text-slate-800">{currentLocation({ status, stateDetail, currentRole, roleName })}</span>
        </p>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
          {t('noWorkflowHistory')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-[560px] items-start">
            {sortedHistory.map((item, index) => {
              const action = item.action || item.Action || 'Action'
              const Icon = actionIcon(action)
              const isLatest = action === latestAction && index === sortedHistory.length - 1
              return (
                <div key={item.id || item.ID || `${action}-${index}`} className="flex min-w-[150px] flex-1 items-start">
                  <div className="flex flex-col items-center text-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${actionTone(action)} ${isLatest ? 'ring-4 ring-slate-100' : ''}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="mb-0 mt-1.5 text-xs font-bold leading-4 text-slate-700">{tAction(action)}</p>
                    <p className="mb-0 mt-1 text-[10px] leading-4 text-slate-400">{formatDateTime(item.created_at || item.CreatedAt)}</p>
                    <p className="mb-0 mt-1 text-[10px] leading-4 text-slate-400">{actorName(item)}</p>
                  </div>
                  {index < sortedHistory.length - 1 ? <div className="mt-5 h-px flex-1 bg-slate-200" /> : null}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
