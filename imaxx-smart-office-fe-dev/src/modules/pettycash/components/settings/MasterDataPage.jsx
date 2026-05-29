import { useMemo, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faPen, faPlus, faSave, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import Breadcrumb from '@/components/AutoBreadcrumb'
import Pagination from '@/components/table/Pagination'
import ConfirmDialog from '../common/ConfirmDialog'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getReasons,
  createReason,
  updateReason,
  deleteReason,
  getSystems,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../services/api.js'
import { useI18n } from '../../i18n'
import { PERMISSION } from '@/constants/permission/permissionEnum'
import {
  extractArray,
  locationName,
  projectName,
  reasonName,
  rowId,
  systemId,
  systemName,
} from '../../utils/formatters'

export default function MasterDataPage({ type, config, permissions = [] }) {
  const { t } = useI18n()
  const [data, setData] = useState([])
  const [systems, setSystems] = useState([])
  const [pettyCashSystemId, setPettyCashSystemId] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', system_id: '', status: 1 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [filters, setFilters] = useState({ keyword: '' })
  const [query, setQuery] = useState({ keyword: '' })
  const canManage = (permissions || []).includes(PERMISSION.MANAGE_PETTYCASH_MASTER) || (type === 'location' && (permissions || []).includes(PERMISSION.EDIT_USER))

  const loadData = useCallback(() => {
    if (type === 'project') {
      getProjects().then((res) => setData(extractArray(res))).catch((err) => toast.error(err.message || t('fetchFailed', { item: pageItemName })))
      return
    }
    if (type === 'location') {
      getLocations().then((res) => setData(extractArray(res))).catch((err) => toast.error(err.message || t('fetchFailed', { item: pageItemName })))
      return
    }
    Promise.all([getSystems(), getReasons({ system: 'petty-cash' })])
      .then(([systemsRes, reasonsRes]) => {
        const systemRows = extractArray(systemsRes)
        const pettyCash = systemRows.find((item) => item.slug === 'petty-cash' || item.Slug === 'petty-cash')
        setSystems(systemRows)
        setPettyCashSystemId(rowId(pettyCash))
        setData(extractArray(reasonsRes))
      })
      .catch((err) => toast.error(err.message || t('fetchFailed', { item: pageItemName })))
  }, [type])

  useEffect(() => {
    loadData()
  }, [loadData])

  const labels = type === 'project'
    ? [t('projectName'), t('projectDetail')]
    : type === 'location'
      ? [t('locationName'), '']
      : [t('reasonName'), '']
  const pageItemName = type === 'project' ? t('project') : type === 'location' ? t('location') : t('reason')
  const addLabel = type === 'project' ? t('addProject') : type === 'location' ? t('addLocation') : t('addReason')
  const getName = (row) => type === 'project' ? projectName(row) : type === 'location' ? locationName(row) : reasonName(row)
  const filteredData = useMemo(() => {
    const keyword = query.keyword.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((row) => {
      const values = [getName(row), row.description || row.Description || '', systemName(row, t('pettyCash'))]
      return values.some((value) => String(value || '').toLowerCase().includes(keyword))
    })
  }, [data, query.keyword])
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pagination.limit))
  const safePage = Math.min(pagination.page, totalPages)
  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pagination.limit
    return filteredData.slice(start, start + pagination.limit)
  }, [filteredData, safePage, pagination.limit])
  const rowNumber = (index) => ((safePage - 1) * pagination.limit) + index + 1

  const handleOpenCreate = () => {
    setCurrentItem(null)
    setFormData({ name: '', description: '', system_id: pettyCashSystemId, status: 1 })
    setModalMode('create')
  }

  const handleOpenEdit = (row) => {
    setCurrentItem(row)
    setFormData({
      name: getName(row),
      description: row.description || row.Description || '',
      system_id: systemId(row) || pettyCashSystemId,
      status: row.status ?? row.Status ?? 1,
    })
    setModalMode('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error(t('requiredField', { field: labels[0] }))
      return
    }
    setIsSubmitting(true)
    try {
      if (type === 'project') {
        const payload = { ProjectName: formData.name, Description: formData.description }
        if (modalMode === 'create') await createProject(payload)
        else await updateProject(rowId(currentItem), payload)
      } else if (type === 'location') {
        const payload = { location_name: formData.name, status: Number(formData.status ?? 1) }
        if (modalMode === 'create') await createLocation(payload)
        else await updateLocation(rowId(currentItem), payload)
      } else {
        const payload = { ReasonName: formData.name, system_id: formData.system_id || pettyCashSystemId }
        if (modalMode === 'create') await createReason(payload)
        else await updateReason(rowId(currentItem), payload)
      }
      setModalMode(null)
      loadData()
    } catch (err) {
      toast.error(err.message || t('saveFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    try {
      const id = rowId(deleteItem)
      if (type === 'project') await deleteProject(id)
      else if (type === 'location') await deleteLocation(id)
      else await deleteReason(id)
      setDeleteItem(null)
      loadData()
    } catch (err) {
      toast.error(err.message || t('deleteFailed'))
    }
  }

  const onSearch = () => {
    setQuery({ keyword: filters.keyword })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearSearch = () => {
    setFilters({ keyword: '' })
    setQuery({ keyword: '' })
    setPagination({ page: 1, limit: 10 })
  }

  return (
    <>
      <div className="breadcrumb">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <div className="page-title d-flex justify-content-between align-items-center mb-4">
            <div className="title-part">
              <h3>{config.title}</h3>
              <div className="sub-title text-muted">{config.subtitle}</div>
            </div>
            {canManage ? (
              <div className="action-part">
                <button className="btn btn-primary" onClick={handleOpenCreate}>
                  <FontAwesomeIcon icon={faPlus} /> {addLabel}
                </button>
              </div>
            ) : null}
          </div>

          <div className="filters search-box mb-4">
            <div className="last-row-filter">
              <div>
                <label htmlFor="master-keyword" className="form-label">{t('keyword')}</label>
                <input
                  id="master-keyword"
                  className="form-control keyword"
                  placeholder={`${t('search')} ${labels[0].toLowerCase()}...`}
                  value={filters.keyword}
                  onChange={(e) => setFilters({ keyword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                />
              </div>
              <div>
                <button type="button" className="btn-search-cancel btn" onClick={clearSearch}>
                  <FontAwesomeIcon icon={faXmark} className="me-2" />
                  {t('clear')}
                </button>
                <button type="button" className="btn btn-search" onClick={onSearch}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
                  {t('search')}
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>{labels[0]}</th>
                  {type === 'project' ? <th>{labels[1]}</th> : null}
                  {type === 'reason' ? <th>{t('system')}</th> : null}
                  <th>{t('status')}</th>
                  {canManage ? <th>{t('action')}</th> : null}
                </tr>
              </thead>
              <tbody>
                {pagedData.map((row, index) => (
                  <tr key={rowId(row) || index}>
                    <td>{rowNumber(index)}</td>
                    <td>{getName(row)}</td>
                    {type === 'project' ? <td>{row.description || row.Description || '-'}</td> : null}
                    {type === 'reason' ? <td>{systemName(row, t('pettyCash'))}</td> : null}
                    <td>
                      <span className={row.status === 1 || row.status === undefined ? 'badge active' : 'badge inactive'}>
                        {t(row.status === 1 || row.status === undefined ? 'active' : 'inactive')}
                      </span>
                    </td>
                    {canManage ? (
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenEdit(row)}>
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger my-2" onClick={() => setDeleteItem(row)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {pagedData.length === 0 ? (
                  <tr><td colSpan={3 + (canManage ? 1 : 0) + (type === 'project' || type === 'reason' ? 1 : 0)} className="text-center">{t('noData')}</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <Pagination
            page={safePage}
            limit={pagination.limit}
            total={filteredData.length}
            totalPages={totalPages}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onLimitChange={(limit) => setPagination({ page: 1, limit })}
            setPage={(page) => setPagination((prev) => ({ ...prev, page }))}
            setLimit={(limit) => setPagination({ page: 1, limit })}
            pageLimitList={[10, 20, 50]}
          />
        </div>
      </div>

      {modalMode && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{modalMode === 'create' ? addLabel : `${t('editData')} ${pageItemName}`}</h5>
                  <button type="button" className="btn-close" onClick={() => setModalMode(null)} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label required">{labels[0]}</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    {type === 'project' ? (
                      <div className="mb-3">
                        <label className="form-label">{labels[1]}</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-control" rows={3} />
                      </div>
                    ) : null}
                    {type === 'reason' ? (
                      <div className="mb-3">
                        <label className="form-label">{t('system')}</label>
                        <select value={formData.system_id || pettyCashSystemId} onChange={(e) => setFormData({ ...formData, system_id: e.target.value })} className="form-select">
                          {systems.filter((item) => item.slug === 'petty-cash' || item.Slug === 'petty-cash').map((item) => (
                            <option key={rowId(item)} value={rowId(item)}>{item.name || item.Name || t('pettyCash')}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    {type === 'location' ? (
                      <div className="mb-3">
                        <label className="form-label d-block">{t('status')}</label>
                        <div className="d-flex gap-4">
                          <label className="form-check-label"><input className="form-check-input me-2" type="radio" checked={Number(formData.status) !== 0} onChange={() => setFormData({ ...formData, status: 1 })} />{t('active')}</label>
                          <label className="form-check-label"><input className="form-check-input me-2" type="radio" checked={Number(formData.status) === 0} onChange={() => setFormData({ ...formData, status: 0 })} />{t('inactive')}</label>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="modal-footer">
                    <button type="button" onClick={() => setModalMode(null)} className="btn btn-secondary">{t('cancel')}</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      <FontAwesomeIcon icon={faSave} className="me-2" />{t('save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteItem}
        title={t('confirmDelete')}
        message={`${t('deleteData')} "${getName(deleteItem)}"?`}
        confirmText={t('deleteData')}
        confirmColor="bg-danger hover:bg-danger-600"
        icon={<FontAwesomeIcon icon={faTrash} className="text-danger" />}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </>
  )
}
