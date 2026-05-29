import { useMemo, useState, useEffect } from 'react'
import Breadcrumb from '@/components/AutoBreadcrumb'
import PageHeader from '@/components/PageHeader'
import CashTable from './CashTable'
import FilterPanel from './FilterPanel'
import StatsRow from './StatsRow'
import ConfirmDialog from '../common/ConfirmDialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { getPettyCashForms, getPettyCashSummary, getProjects, getReasons, getUsers, exportReportExcel, cancelPettyCash } from '../../services/api.js'
import { PERMISSION } from '@/constants/permission/permissionEnum'
import { useI18n } from '../../i18n'
import { extractArray } from '../../utils/formatters'

const can = (permissions, permission) => (permissions || []).includes(permission)

export default function CashListPage({ page, config, onCreate, createLoading = false, onOpen, currentUser, reloadKey, permissions = [] }) {
  const { t } = useI18n()
  const [requests, setRequests] = useState([])
  const [filters, setFilters] = useState({})
  const [projects, setProjects] = useState([])
  const [reasons, setReasons] = useState([])
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 })
  const [deleteRow, setDeleteRow] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const canCreate = can(permissions, PERMISSION.CREATE_PETTYCASH)
  const canDeleteRequest = can(permissions, PERMISSION.CANCEL_PETTYCASH) || can(permissions, PERMISSION.DELETE_PETTYCASH) || canCreate
  const canReport = can(permissions, PERMISSION.VIEW_PETTYCASH_REPORT)
  const canExportReport = can(permissions, PERMISSION.EXPORT_PETTYCASH_REPORT) || can(permissions, PERMISSION.EXPORT_REPORT)

  useEffect(() => {
    const shouldLoadUsers = page === 'myTasks' || (page === 'summary' && canReport)
    Promise.all([
      getProjects(),
      getReasons({ system: 'petty-cash' }),
      shouldLoadUsers ? getUsers() : Promise.resolve([]),
    ])
      .then(([projectData, reasonData, userData]) => {
        setProjects(extractArray(projectData))
        setReasons(extractArray(reasonData))
        setUsers(extractArray(userData))
      })
      .catch(() => toast.error(t('fetchFailed', { item: t('pettyCash') })))
  }, [page, currentUser])

  useEffect(() => {
    const requestFilters = { ...filters, page: pagination.page, limit: pagination.limit }
    if (page === 'myTasks') requestFilters.view = 'tasks'
    if (page === 'summary' && canReport) requestFilters.view = 'all'

    Promise.all([getPettyCashForms(requestFilters), getPettyCashSummary(requestFilters)])
      .then(([data, summaryData]) => {
        const rows = Array.isArray(data) ? data : (data?.data || [])
        setRequests(rows)
        if (!Array.isArray(data) && data?.pagination) {
          setPagination((prev) => ({ ...prev, ...data.pagination }))
        }
        setSummary(summaryData || null)
      })
      .catch(() => toast.error(t('loadFailed')))
  }, [page, currentUser, reloadKey, refreshKey, filters, pagination.page, pagination.limit])

  const rows = useMemo(() => requests, [requests])

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleDeleteConfirm = async () => {
    if (!deleteRow?.id) return
    try {
      await cancelPettyCash(deleteRow.id, { remark: '' })
      toast.success(t('deleteData'))
      setDeleteRow(null)
      setRefreshKey((value) => value + 1)
    } catch (err) {
      toast.error(err.message || t('deleteFailed'))
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <PageHeader
            title={config.title}
            subtitle={config.subtitle}
            action={page === 'myCash' && canCreate ? (
              <button className="btn btn-primary" onClick={onCreate} disabled={createLoading}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('createPettyCashRequest')}
              </button>
            ) : null}
          />

          {(page === 'myCash' || page === 'summary') ? (
            <StatsRow summary={summary} activeStatus={filters.status || ''} onStatusClick={handleStatusFilter} />
          ) : null}
          {page === 'summary' && canExportReport ? (
            <div className="mb-3 d-flex justify-content-end">
              <button type="button" onClick={() => exportReportExcel(rows, filters, { reportTitle: t('pettyCashReport'), noData: t('noData') })} className="btn btn-success">
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                {t('exportExcel')}
              </button>
            </div>
          ) : null}
          <FilterPanel
            variant={page === 'myCash' ? 'default' : 'advanced'}
            value={filters}
            onSearch={(nextFilters) => {
              setFilters(nextFilters)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            onClear={() => {
              setFilters({})
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            projects={projects}
            reasons={reasons}
            users={users}
            showUserFilter={page === 'myTasks' || (page === 'summary' && canReport)}
          />
          <CashTable
            rows={rows}
            showDelete={page === 'myCash' && canDeleteRequest}
            showRequester={page !== 'myCash'}
            onOpen={(row) => onOpen(row, page)}
            onDelete={setDeleteRow}
            pagination={pagination}
            onPageChange={(nextPage) => setPagination((prev) => ({ ...prev, page: nextPage }))}
            onLimitChange={(nextLimit) => setPagination((prev) => ({ ...prev, page: 1, limit: nextLimit }))}
          />
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteRow}
        title={t('confirmDelete')}
        message={`${t('deleteData')} "${deleteRow?.documentNo || deleteRow?.title || ''}"?`}
        confirmText={t('delete')}
        confirmColor="bg-danger-600 hover:bg-danger"
        icon={<FontAwesomeIcon icon={faTrash} className="h-6 w-6 text-danger" />}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteRow(null)}
      />
    </>
  )
}
