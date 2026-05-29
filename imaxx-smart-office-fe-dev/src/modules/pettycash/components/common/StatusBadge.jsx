import { useI18n } from '../../i18n'

const statusStyles = {
  Completed: 'bg-success',
  Active: 'active',
  Inactive: 'inactive',
  Canceled: 'bg-danger',
  Cancelled: 'bg-danger',
  Rejected: 'bg-danger',
  Draft: 'bg-secondary',
  Waiting: 'bg-warning text-dark',
  'Waiting Manager Approval': 'bg-warning text-dark',
  'Waiting Finance Approval': 'bg-warning text-dark',
  'Waiting Approver 1 Approval': 'bg-warning text-dark',
  'Waiting Approver 2': 'bg-warning text-dark'
}

export default function StatusBadge({ status }) {
  const { tStatus } = useI18n()
  const label = tStatus(status)
  const style = (String(status || '').toLowerCase().startsWith('waiting') || String(status || '').startsWith('รอ'))
    ? 'bg-warning text-dark'
    : (statusStyles[status] || 'bg-secondary')

  return (
    <span className={`badge ${style}`}>
      {label}
    </span>
  )
}
