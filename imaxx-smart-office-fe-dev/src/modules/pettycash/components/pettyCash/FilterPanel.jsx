import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '../../i18n'

const emptyFilters = {
  submitDate: '',
  endDate: '',
  year: '',
  status: '',
  project: '',
  reason: '',
  user_id: '',
  keyword: '',
}

function Field({ label, name, value, onChange, placeholder, type = 'text', options }) {
  return (
    <label className="w-100">
      <span className="form-label">{label}</span>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-select"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control w-100"
        />
      )}
    </label>
  )
}

export default function FilterPanel({ compact = false, variant = 'advanced', value, onSearch, onClear, projects = [], reasons = [], users = [], showUserFilter = false }) {
  const [filters, setFilters] = useState(emptyFilters)
  const { t, tStatus } = useI18n()

  useEffect(() => {
    setFilters({ ...emptyFilters, ...(value || {}) })
  }, [value])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters(emptyFilters)
    onClear?.()
  }

  const handleSearch = () => {
    onSearch?.(filters)
  }

  const statusOptions = [
    { value: '1', label: tStatus('Draft') },
    { value: '2', label: tStatus('Waiting') },
    { value: '1,2', label: t('inProgress') },
    { value: '3', label: tStatus('Completed') },
    { value: '4', label: tStatus('Rejected') },
    { value: '5', label: tStatus('Cancelled') },
  ]
  const projectOptions = projects.map((project) => ({
    value: project.id || project.ID,
    label: project.projectname || project.project_name || project.ProjectName || project.name || 'Project',
  }))
  const reasonOptions = reasons.map((reason) => ({
    value: reason.id || reason.ID,
    label: reason.reasonname || reason.reason_name || reason.ReasonName || reason.name || 'Reason',
  }))
  const userOptions = users.map((user) => ({
    value: user.id || user.ID,
    label: [user.first_name || user.FirstName, user.last_name || user.LastName].filter(Boolean).join(' ') || user.username || user.Username || 'User',
  }))

  const isDefault = variant === 'default'

  return (
    <div className="filters mb-4">
      {!compact && isDefault ? (
        <div className="row">
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('submitDate')} name="submitDate" type="date" value={filters.submitDate} onChange={handleChange} placeholder={t('selectDate')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('endDate')} name="endDate" type="date" value={filters.endDate} onChange={handleChange} placeholder={t('selectDate')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('year')} name="year" type="number" value={filters.year} onChange={handleChange} placeholder={t('selectYear')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('status')} name="status" value={filters.status} onChange={handleChange} placeholder={t('allStatus')} options={statusOptions} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('project')} name="project" value={filters.project} onChange={handleChange} placeholder={t('allProject')} options={projectOptions} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('reason')} name="reason" value={filters.reason} onChange={handleChange} placeholder={t('allReason')} options={reasonOptions} />
          </div>
        </div>
      ) : null}
      {!compact && !isDefault ? (
        <div className="row">
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('submitDate')} name="submitDate" type="date" value={filters.submitDate} onChange={handleChange} placeholder={t('selectDate')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('endDate')} name="endDate" type="date" value={filters.endDate} onChange={handleChange} placeholder={t('selectDate')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('year')} name="year" type="number" value={filters.year} onChange={handleChange} placeholder={t('selectYear')} />
          </div>
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('project')} name="project" value={filters.project} onChange={handleChange} placeholder={t('allProject')} options={projectOptions} />
          </div>
          {showUserFilter ? (
            <div className="col-12 col-md-4 mb-2">
              <Field label={t('user')} name="user_id" value={filters.user_id} onChange={handleChange} placeholder={t('allUsersFilter')} options={userOptions} />
            </div>
          ) : null}
          <div className="col-12 col-md-4 mb-2">
          <Field label={t('reason')} name="reason" value={filters.reason} onChange={handleChange} placeholder={t('allReason')} options={reasonOptions} />
          </div>
        </div>
      ) : null}
      <div className="last-row-filter">
        {!isDefault ? (
          <div className="pettycash-status-filter">
            <Field label={t('status')} name="status" value={filters.status} onChange={handleChange} placeholder={t('allStatus')} options={statusOptions} />
          </div>
        ) : null}
        <div className={!isDefault ? 'pettycash-keyword-filter' : ''}>
        <Field label={`${t('keyword')} (${t('keywordScope')})`} name="keyword" value={filters.keyword} onChange={handleChange} placeholder={t('searchItems')} />
        </div>
        <div className="pettycash-filter-actions">
        <button type="button" onClick={handleClear} className="btn btn-search-cancel">
          <FontAwesomeIcon icon={faXmark} className="me-2" />
          {t('clear')}
        </button>
        <button type="button" onClick={handleSearch} className="btn btn-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
          {t('search')}
        </button>
        </div>
      </div>
    </div>
  )
}
