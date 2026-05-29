import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import ProfileViewer from '@/components/ProfileViewer'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import { useI18n } from '../../i18n'

const canDeleteStatus = (status) => ['Draft', 'Rejected'].includes(status)

export default function CashTable({ rows, showDelete = false, showRequester = true, onOpen, onDelete, pagination, onPageChange, onLimitChange }) {
  const { t } = useI18n()
  const renderRequester = (row) => row.requesterName || row.requester_name || row.ownerName || '-'
  const requesterAvatar = (row) => row.requesterAvatarPath || row.requester_avatar_path || row.avatar_path || row.profile_image_url || ''
  const RequesterIdentity = ({ row }) => {
    const name = renderRequester(row)
    const avatar = requesterAvatar(row)
    return (
      <div className="user-details-col" style={{ overflow: 'hidden' }}>
        <div className="user-details d-flex align-items-start">
          <div className="me-2 mt-1 user-details-avatar flex-shrink-0">
            <ProfileViewer name={name} filePath={avatar} size={10} className="" profileFor="others" />
          </div>
          <div className="user-details-name" style={{ minWidth: 0 }}>
            <div className="name text-capitalize text-truncate">{name}</div>
            {row.requesterRole ? (
              <div className="username text-truncate" style={{ fontSize: '0.75rem', color: '#6c757d' }}>{row.requesterRole}</div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
  const rowNumber = (index) => (((pagination?.page || 1) - 1) * (pagination?.limit || 10)) + index + 1

  return (
    <div>
      <div className="d-md-none">
        {rows.map((row, index) => (
          <article key={row.id} className="card my-3">
            <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="min-w-0">
                <button type="button" onClick={() => onOpen(row)} className="btn btn-link p-0 fw-semibold text-decoration-none">
                  {row.documentNo || `#${rowNumber(index)}`}
                </button>
                <p className="mb-0 small text-muted">{row.date}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <button type="button" onClick={() => onOpen(row)} className="btn btn-link mt-2 w-100 p-0 text-start fw-semibold text-decoration-none text-dark">
              {row.title || '-'}
            </button>
            {row.rejectReason ? (
              <p className="alert alert-danger py-1 px-2 small mt-2 mb-0">
                {t('rejectReason')}: {row.rejectReason}
              </p>
            ) : null}

            <dl className="row g-2 small mt-2 mb-0">
              {showRequester ? (
                <div className="col-12">
                  <dt className="text-muted text-uppercase">{t('requester')}</dt>
                  <dd className="mb-0"><RequesterIdentity row={row} /></dd>
                </div>
              ) : null}
              <div className={showRequester ? 'col-12' : 'col-6'}>
                <dt className="text-muted text-uppercase">{t('amount')}</dt>
                <dd className="mb-0 fw-semibold">{row.amount}</dd>
              </div>
              <div className="col-6">
                <dt className="text-muted text-uppercase">{t('project')}</dt>
                <dd className="mb-0">{row.project}</dd>
              </div>
              <div className="col-6">
                <dt className="text-muted text-uppercase">{t('reason')}</dt>
                <dd className="mb-0">{row.reason}</dd>
              </div>
            </dl>

            <div className="mt-3 d-flex justify-content-end gap-2 border-top pt-3">
              <button type="button" onClick={() => onOpen(row)} className="btn btn-sm btn-outline-primary">
                <FontAwesomeIcon icon={faEye} className="me-1 h-4 w-4" />
                {t('view')}
              </button>
              {showDelete && canDeleteStatus(row.status) ? (
                <button type="button" onClick={() => onDelete?.(row)} className="btn btn-sm btn-outline-danger">
                  <FontAwesomeIcon icon={faTrash} className="me-1 h-4 w-4" />
                  {t('delete')}
                </button>
              ) : null}
            </div>
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <div className="text-center text-muted py-4">
            {t('noData')}
          </div>
        ) : null}
      </div>

      <div className="table-responsive d-none d-md-block">
      <table className="table align-middle">
        <thead className="table-light">
          <tr>
            <th className="text-center">#</th>
            <th>{t('documentNoDate')}</th>
            {showRequester ? <th>{t('requester')}</th> : null}
            <th>{t('title')}</th>
            <th>{t('project')}</th>
            <th>{t('reason')}</th>
            <th className="text-end">{t('amount')}</th>
            <th>{t('status')}</th>
            <th className="text-center">{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td className="text-center">{rowNumber(index)}</td>
              <td>
                <button type="button" onClick={() => onOpen(row)} className="btn btn-link p-0 fw-semibold text-decoration-none">{row.documentNo}</button>
                <div className="small text-muted">{row.date}</div>
              </td>
              {showRequester ? (
                <td>
                  <RequesterIdentity row={row} />
                </td>
              ) : null}
              <td>
                <div>{row.title}</div>
                {row.rejectReason ? (
                  <div className="small fw-medium text-danger">
                    {t('rejectReason')}: {row.rejectReason}
                  </div>
                ) : null}
              </td>
              <td>{row.project}</td>
              <td>
                {row.reason || '-'}
              </td>
              <td className="text-end fw-medium">{row.amount}</td>
              <td><StatusBadge status={row.status} /></td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onOpen(row)}>
                    <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                  </button>
                  {showDelete && canDeleteStatus(row.status) ? (
                    <button type="button" onClick={() => onDelete?.(row)} className="btn btn-sm btn-outline-danger">
                      <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showRequester ? 9 : 8} className="text-center text-muted">{t('noData')}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
      <Pagination
        page={pagination?.page || 1}
        limit={pagination?.limit || 10}
        total={pagination?.total || rows.length}
        totalPages={pagination?.total_pages || pagination?.totalPages || 1}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  )
}
