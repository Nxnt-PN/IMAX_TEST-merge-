import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faClock, faFileLines } from '@fortawesome/free-regular-svg-icons'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '../../i18n'

export default function StatsRow({ summary, activeStatus = '', onStatusClick }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const inProgress = Number(summary?.draft_requests || 0) + Number(summary?.waiting_requests || 0)
  const stats = [
    {
      label: t('totalRequests'),
      value: summary?.total_requests ?? 0,
      status: '',
      icon: faFileLines,
      tone: 'primary',
      className: 'petty-stat-primary',
    },
    {
      label: t('completedPaid'),
      value: summary?.completed_requests ?? 0,
      status: '3',
      icon: faCircleCheck,
      tone: 'success',
      className: 'petty-stat-success',
    },
    {
      label: t('rejected'),
      value: summary?.rejected_requests ?? 0,
      status: '4',
      icon: faCircleXmark,
      tone: 'danger',
      className: 'petty-stat-danger',
    },
    {
      label: t('inProgress'),
      value: inProgress,
      status: '1,2',
      icon: faClock,
      tone: 'warning',
      className: 'petty-stat-warning',
    },
  ]

  return (
    <div className="petty-stats-section mb-3">
      {/* Toggle button — แสดงเฉพาะ mobile (< sm) */}
      <button
        type="button"
        className="petty-stats-toggle d-sm-none"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="petty-stats-toggle-dots">
          {stats.map((stat) => (
            <span
              key={stat.label}
              className={`petty-stats-dot petty-stats-dot-${stat.tone}`}
              title={`${stat.label}: ${stat.value}`}
            />
          ))}
        </span>
        <span className="petty-stats-toggle-label">
          {t('totalRequests')}: <strong>{summary?.total_requests ?? 0}</strong>
        </span>
        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="petty-stats-toggle-icon" />
      </button>

      {/* Cards grid */}
      <div className={`row g-2 petty-stats-grid${expanded ? ' petty-stats-grid--open' : ''}`}>
        {stats.map((stat) => (
          <div key={stat.label} className="col-6 col-sm-6 col-lg-3">
            <button
              type="button"
              className={`petty-stat-card ${stat.className}${activeStatus === stat.status ? ' is-active' : ''}`}
              onClick={() => onStatusClick?.(stat.status)}
              aria-pressed={activeStatus === stat.status}
            >
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="min-w-0">
                  <p className="mb-1 petty-stat-label text-muted">{stat.label}</p>
                  <p className={`mb-0 petty-stat-value fw-bold lh-1 text-${stat.tone}`}>{stat.value}</p>
                </div>
                <span className={`petty-stat-icon text-${stat.tone}`} title={stat.label}>
                  <FontAwesomeIcon icon={stat.icon} />
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
