import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faFileLines, faPaperPlane, faSave } from '@fortawesome/free-regular-svg-icons'
import { faPlus, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
import StatusBadge from '../common/StatusBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import LabeledBox from './modal/LabeledBox'
import ModalFooter from './modal/ModalFooter'
import ProjectBlock from './modal/ProjectBlock'
import RejectComment from './modal/RejectComment'
import RequestMeta from './modal/RequestMeta'
import WorkflowPanel from './modal/WorkflowPanel'
import ActivityHistory from './modal/ActivityHistory'
import { modalTheme } from './modal/workflow'
import {
  createPettyCashForm,
  updatePettyCashForm,
  submitPettyCash,
  approvePettyCash,
  rejectPettyCash,
  cancelPettyCash,
  resendPettyCash,
  getProjects,
  getReasons,
  downloadPettyCashPdf,
} from '../../services/api.js'
import { useI18n } from '../../i18n'
import { PERMISSION } from '@/constants/permission/permissionEnum'
import { extractArray } from '../../utils/formatters'

const today = () => new Date().toISOString().split('T')[0]
const getId = (item) => item?.id || item?.ID || ''

const toDateInput = (value) => {
  if (!value) return today()
  return String(value).split('T')[0]
}

const toBlockFromItem = (item, idx) => ({
  id: item.id || item.ID || Date.now() + idx,
  project_id: item.project_id || item.ProjectID || '',
  reason_id: item.reason_id || item.ReasonID || '',
  receipt_url: item.receipt_url || item.receiptUrl || item.attachments?.[0]?.file_path || item.attachments?.[0]?.filePath || '',
  project: item.project || '-',
  reason: item.reason || '-',
  items: [{
    id: Date.now() + idx + 1000,
    date: toDateInput(item.date),
    description: item.description || '',
    note: item.note || '',
    amount: item.amount || item.total || '',
  }],
})

const emptyBlock = () => ({
  id: Date.now(),
  project_id: '',
  reason_id: '',
  receipt_url: '',
  items: [{ id: Date.now() + 1, date: today(), description: '', note: '', amount: '' }],
})

const can = (permissions, permission) => (permissions || []).includes(permission)

export default function PettyCashModal({ modal, onClose, currentUser, permissions = [] }) {
  const { t } = useI18n()
  const [confirmAction, setConfirmAction] = useState(null)
  const [formData, setFormData] = useState({
    title: modal.request?.title || '',
    blocks: modal.request?.blocks?.length > 0
      ? modal.request.blocks
      : (modal.request?.items?.length > 0 ? modal.request.items.map(toBlockFromItem) : [emptyBlock()]),
  })
  const [projects, setProjects] = useState([])
  const [reasons, setReasons] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendEditing, setIsResendEditing] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const status = modal.request?.status || 'Draft'
  const isCreate = modal.mode === 'create'
  const isEdit = modal.mode === 'edit'
  const isEditable = isCreate || isEdit || isResendEditing
  const isTask = modal.sourcePage === 'myTasks'
  const isRejected = status === 'Rejected'
  const theme = modalTheme(status)
  const requester = modal.request?.requester || modal.request?.user || modal.request?.User || currentUser
  const requestDate = modal.request?.created_at || modal.request?.CreatedAt || modal.request?.date || new Date().toISOString()
  const canSave = can(permissions, PERMISSION.SAVE_PETTYCASH)
  const canSubmit = can(permissions, PERMISSION.SUBMIT_PETTYCASH)
  const canApprove = can(permissions, PERMISSION.APPROVE_PETTYCASH)
  const canReject = can(permissions, PERMISSION.REJECT_PETTYCASH)
  const canCancel = can(permissions, PERMISSION.CANCEL_PETTYCASH)
  const canResend = can(permissions, PERMISSION.RESEND_PETTYCASH)
  const canExport = can(permissions, PERMISSION.EXPORT_PETTYCASH_REPORT) || can(permissions, PERMISSION.EXPORT_REPORT)

  useEffect(() => {
    if (!isEditable) return
    Promise.all([getProjects(), getReasons({ system: 'petty-cash' })])
      .then(([projectData, reasonData]) => {
        setProjects(extractArray(projectData))
        setReasons(extractArray(reasonData))
      })
      .catch(() => toast.error(t('fetchFailed', { item: t('pettyCash') })))
  }, [isEditable])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlockChange = (blockIndex, field, value) => {
    setFormData((prev) => {
      const blocks = [...prev.blocks]
      blocks[blockIndex] = { ...blocks[blockIndex], [field]: value }
      return { ...prev, blocks }
    })
  }

  const handleItemChange = (blockIndex, itemIndex, field, value) => {
    setFormData((prev) => {
      const blocks = [...prev.blocks]
      const items = [...blocks[blockIndex].items]
      items[itemIndex] = { ...items[itemIndex], [field]: value }
      blocks[blockIndex] = { ...blocks[blockIndex], items }
      return { ...prev, blocks }
    })
  }

  const handleAddItemToBlock = (blockIndex) => {
    setFormData((prev) => {
      const blocks = prev.blocks.map((block, index) => (
        index === blockIndex
          ? {
              ...block,
              items: [...(block.items || []), { id: Date.now(), date: today(), description: '', note: '', amount: '' }],
            }
          : block
      ))
      return { ...prev, blocks }
    })
  }

  const handleRemoveItemFromBlock = (blockIndex, itemIndex) => {
    setFormData((prev) => {
      const blocks = prev.blocks.map((block, index) => {
        if (index !== blockIndex) return block
        const nextItems = (block.items || []).filter((_, i) => i !== itemIndex)
        return {
          ...block,
          items: nextItems.length > 0
            ? nextItems
            : [{ id: Date.now(), date: today(), description: '', note: '', amount: '' }],
        }
      })
      return { ...prev, blocks }
    })
  }

  const handleAddBlock = () => {
    setFormData((prev) => ({ ...prev, blocks: [...prev.blocks, emptyBlock()] }))
  }

  const handleRemoveBlock = (blockIndex) => {
    setFormData((prev) => {
      const blocks = prev.blocks.filter((_, i) => i !== blockIndex)
      return { ...prev, blocks: blocks.length > 0 ? blocks : [emptyBlock()] }
    })
  }

  const isCompleteItem = (block, item) => (
    block.project_id &&
    block.reason_id &&
    item.date &&
    item.description &&
    Number(item.amount) > 0
  )

  const validateDraft = () => {
    const nextErrors = {}
    if (!formData.title.trim()) nextErrors.title = t('requestTitleRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('requestTitleRequired'))
      return false
    }
    return true
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!formData.title.trim()) nextErrors.title = t('requestTitleRequired')

    formData.blocks.forEach((block, bIndex) => {
      if (!block.project_id) nextErrors[`block_${bIndex}_project`] = 'Required'
      if (!block.reason_id) nextErrors[`block_${bIndex}_reason`] = 'Required'
      block.items.forEach((item, iIndex) => {
        if (!item.date) nextErrors[`block_${bIndex}_item_${iIndex}_date`] = 'Required'
        if (!item.description) nextErrors[`block_${bIndex}_item_${iIndex}_desc`] = 'Required'
        if (!item.amount || Number(item.amount) <= 0) nextErrors[`block_${bIndex}_item_${iIndex}_amount`] = 'Required'
      })
    })

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('requestFormRequired'))
      return false
    }
    return true
  }
  const buildPayload = (remark = '', { draft = false } = {}) => ({
    title: formData.title,
    note: '',
    remark,
    items: formData.blocks.flatMap((block) => block.items
      .filter((item) => !draft || isCompleteItem(block, item))
      .map((item) => ({
        project_id: block.project_id,
        reason_id: block.reason_id,
        date: item.date || undefined,
        description: item.description,
        note: item.note || '',
        amount: parseFloat(item.amount) || 0,
        attachments: block.receipt_url ? [{ file_name: 'Receipt', file_path: block.receipt_url, file_size: 0 }] : [],
      }))),
  })
  const handleActionClick = (action) => {
    if (action === 'resend' && !isResendEditing) {
      setIsResendEditing(true)
      return
    }
    if (action === 'draft' && !validateDraft()) return
    if (['submit', 'resend'].includes(action) && !validateForm()) return
    setConfirmAction(action)
  }

  const handleCloseRequest = () => {
    if (isCreate || isEdit || isResendEditing) {
      setConfirmAction('closeDraft')
      return
    }
    onClose()
  }

  const handleCloseDraftDiscard = () => {
    setConfirmAction(null)
    onClose()
  }

  const handleActionConfirm = async (remark) => {
    try {
      setIsSubmitting(true)
      if (confirmAction === 'reject' && (!remark || !remark.trim())) {
        toast.error(t('rejectReasonRequiredMessage'))
        return
      }

      if (confirmAction === 'draft' || confirmAction === 'submit' || confirmAction === 'closeDraft') {
        if (confirmAction === 'submit' && !validateForm()) return
        if (confirmAction !== 'submit' && !validateDraft()) return
        let formId = getId(modal.request)
        const payload = buildPayload(remark || '', { draft: confirmAction !== 'submit' })
        if (isResendEditing) {
          await resendPettyCash(formId, payload)
        } else if (isCreate) {
          const created = await createPettyCashForm(payload)
          formId = getId(created)
        } else {
          await updatePettyCashForm(formId, payload)
        }
        if (confirmAction === 'submit' && !isResendEditing) {
          await submitPettyCash(formId, { remark: remark || '' })
        }
      } else if (confirmAction === 'resend') {
        await resendPettyCash(getId(modal.request), buildPayload(remark || ''))
      } else if (confirmAction === 'approve') {
        await approvePettyCash(getId(modal.request), { remark: remark || '' })
      } else if (confirmAction === 'reject') {
        await rejectPettyCash(getId(modal.request), { remark })
      } else if (confirmAction === 'cancel') {
        await cancelPettyCash(getId(modal.request), { remark: remark || '' })
      }

      setConfirmAction(null)
      onClose({ refresh: true })
    } catch (err) {
      toast.error(t('saveError', { message: err.message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotal = () => formData.blocks.reduce((blockSum, block) => {
    const itemsSum = block.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    return blockSum + itemsSum
  }, 0)

  const handleDownloadPdf = () => {
    const fileName = `${modal.request?.documentNo || modal.request?.document_no || getId(modal.request)}.pdf`
    downloadPettyCashPdf(getId(modal.request), fileName).catch((err) => toast.error(err.message))
  }

  const dialogProps = {
    submit: {
      title: t('confirmSubmitTitle'),
      message: t('confirmSubmitMessage'),
      confirmText: t('submit'),
      confirmColor: 'bg-primary hover:bg-primary-700',
      icon: <FontAwesomeIcon icon={faPaperPlane} className="h-6 w-6 text-primary" />,
      showReason: true,
      reasonLabel: t('optionalRemark'),
    },
    draft: {
      title: t('saveDraftTitle'),
      message: t('saveDraftMessage'),
      confirmText: t('saveDraft'),
      confirmColor: 'bg-slate-600 hover:bg-slate-700',
      icon: <FontAwesomeIcon icon={faSave} className="h-6 w-6 text-slate-600" />,
      showReason: true,
      reasonLabel: t('optionalRemark'),
    },
    closeDraft: {
      title: isResendEditing ? t('resendBeforeClosingTitle') : t('saveAsDraftTitle'),
      message: isResendEditing ? t('resendBeforeClosingMessage') : t('saveAsDraftMessage'),
      confirmText: isResendEditing ? t('resend') : t('saveDraft'),
      cancelText: isResendEditing ? t('closeWithoutResending') : t('closeWithoutSaving'),
      confirmColor: 'bg-slate-600 hover:bg-slate-700',
      icon: <FontAwesomeIcon icon={faFileLines} className="h-6 w-6 text-slate-600" />,
      showReason: true,
      reasonLabel: t('optionalRemark'),
    },
    resend: {
      title: t('resendRequestTitle'),
      message: t('resendRequestMessage'),
      confirmText: t('resend'),
      confirmColor: 'bg-warning hover:opacity-90',
      icon: <FontAwesomeIcon icon={faPaperPlane} className="h-6 w-6 text-warning" />,
      showReason: true,
      reasonLabel: t('optionalRemark'),
    },
    approve: {
      title: t('approveRequestTitle'),
      message: t('approveRequestMessage'),
      confirmText: t('approve'),
      confirmColor: 'bg-success hover:bg-success-hover',
      icon: <FontAwesomeIcon icon={faCircleCheck} className="h-6 w-6 text-success" />,
      showReason: true,
      reasonLabel: t('optionalRemark'),
    },
    reject: {
      title: t('rejectRequestTitle'),
      message: t('rejectRequestMessage'),
      confirmText: t('reject'),
      confirmColor: 'bg-danger-600 hover:bg-danger',
      icon: <FontAwesomeIcon icon={faCircleXmark} className="h-6 w-6 text-danger" />,
      showReason: true,
      reasonLabel: t('rejectReasonRequired'),
    },
    cancel: {
      title: t('cancelRequestTitle'),
      message: t('cancelRequestMessage'),
      confirmText: t('cancelRequest'),
      confirmColor: 'bg-danger-600 hover:bg-danger',
      icon: <FontAwesomeIcon icon={faTriangleExclamation} className="h-6 w-6 text-danger" />,
      showReason: true,
      reasonLabel: t('cancelReasonOptional'),
    },
  }

  const currentDialog = confirmAction ? dialogProps[confirmAction] : null

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:px-4 sm:py-6">
      <div className="relative flex h-[100dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-none bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)] sm:h-[calc(100vh-48px)] sm:max-h-[94vh] sm:rounded-2xl" style={{ fontSize: 'inherit' }}>
        {/* ── Modal Header ── */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-[15px] font-bold leading-tight text-slate-800">{t('pettyCashRequest')}</h2>
                  <div className="shrink-0">
                    <StatusBadge status={isCreate ? 'Draft' : status} />
                  </div>
                </div>
                <p className="mt-0.5 truncate text-[10px] font-medium tracking-[0.18em] text-slate-400">PETTY CASH REQUEST</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!isCreate ? (
              <button type="button" onClick={() => setIsHistoryOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-500 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('history')}</span>
              </button>
            ) : null}
            <button type="button" onClick={handleCloseRequest} className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-slate-400 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-3.5 sm:px-7 sm:py-6">
          {!isCreate ? (
            <>
              <WorkflowPanel
                status={status}
                theme={theme}
                history={modal.request?.history || []}
                stateDetail={modal.request?.state_detail || modal.request?.stateDetail}
                currentRole={modal.request?.currentRole}
                roleName={modal.request?.role?.name || modal.request?.Role?.Name}
              />
            </>
          ) : null}
          {isRejected ? (
            <div className="mt-3 sm:mt-4">
              <RejectComment
                comment={modal.request?.reject_comment || modal.request?.rejectComment || modal.request?.rejectReason}
                rejectedAt={modal.request?.rejected_at || modal.request?.rejectedAt}
                rejectedBy={modal.request?.rejected_by_name || modal.request?.rejectedByName || modal.request?.rejectedUserName}
              />
            </div>
          ) : null}

          <form onSubmit={(e) => e.preventDefault()} className={isCreate ? '' : 'mt-3 sm:mt-5'}>
            {/* Requester info */}
            <div className="mb-3.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 sm:mb-5 sm:px-5 sm:py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('requesterInfo')}</p>
              <RequestMeta user={requester} requestDate={requestDate} />
            </div>

            {/* Request title */}
            {isEditable ? (
              <div className="mb-3.5 sm:mb-5">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('requestTitle')}
                  <span className="ml-1 text-red-500">*</span>
                  <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-slate-300">({t('requestTitleHint')})</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-xl border px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-300 ${
                    errors.title
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10'
                  }`}
                  placeholder={t('requestTitlePlaceholder')}
                />
                {errors.title && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <span>⚠</span> {errors.title}
                  </p>
                )}
              </div>
            ) : (
              <LabeledBox className="mb-3.5 sm:mb-5" label={`${t('requestTitle')} (${t('requestTitleHint')})`} value={formData.title || '-'} />
            )}

            {/* Project blocks */}
            {formData.blocks.map((block, index) => (
              <ProjectBlock
                key={block.id || index}
                blockIndex={index}
                block={block}
                editable={isEditable}
                projects={projects}
                reasons={reasons}
                errors={errors}
                onBlockChange={handleBlockChange}
                onItemChange={handleItemChange}
                onAddItem={handleAddItemToBlock}
                onRemoveItem={handleRemoveItemFromBlock}
                onRemoveBlock={handleRemoveBlock}
              />
            ))}

            {/* Add project block */}
            {isEditable ? (
              <button
                type="button"
                onClick={handleAddBlock}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-400 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                {t('addProjectBlock')}
              </button>
            ) : null}
          </form>
        </div>

        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        <ModalFooter
          status={status}
          isCreate={isCreate || isEdit || isResendEditing}
          isResendEdit={isResendEditing}
          isTask={isTask && !isResendEditing}
          onClose={handleCloseRequest}
          onAction={handleActionClick}
          onDownloadPdf={handleDownloadPdf}
          totalAmount={calculateTotal()}
          canSave={canSave}
          canSubmit={canSubmit}
          canApprove={canApprove}
          canReject={canReject}
          canCancel={canCancel}
          canResend={canResend}
          canExport={canExport}
        />
      </div>

      <ActivityHistory drawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={modal.request?.history || []} />

      <ConfirmDialog
        isOpen={!!confirmAction}
        onConfirm={handleActionConfirm}
        onCancel={confirmAction === 'closeDraft' ? handleCloseDraftDiscard : () => setConfirmAction(null)}
        {...currentDialog}
      />
    </div>
  )
}

