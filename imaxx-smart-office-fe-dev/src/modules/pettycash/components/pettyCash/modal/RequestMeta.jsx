import { useI18n } from '../../../i18n'
import LabeledBox from './LabeledBox'

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getLocationName = (user) => (
  user?.location_name ||
  user?.locationName ||
  user?.location?.location_name ||
  user?.location?.LocationName ||
  user?.Location?.location_name ||
  user?.Location?.LocationName ||
  '-'
)

export default function RequestMeta({ user, requestDate }) {
  const { t } = useI18n()
  const firstName = user?.first_name || user?.FirstName || (user?.name ? user.name.split(' ')[0] : '') || '-'
  const lastName = user?.last_name || user?.LastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || '-'

  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3.5">
      <LabeledBox label={t('firstName')} value={firstName} />
      <LabeledBox label={t('lastName')} value={lastName} />
      <LabeledBox label={t('location')} value={getLocationName(user)} muted />
      <LabeledBox label={t('submitDate')} value={formatDate(requestDate)} />
    </div>
  )
}
