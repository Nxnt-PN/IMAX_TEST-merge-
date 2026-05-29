import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '../../../i18n'
import LabeledBox from './LabeledBox'
import FileInput from '../FileInput'
import { assetUrl } from '../../../services/api'

export default function ProjectBlock({
  block,
  blockIndex,
  editable = false,
  projects = [],
  reasons = [],
  errors = {},
  onBlockChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onRemoveBlock,
}) {
  const { t, language } = useI18n()
  const locale = language === 'th' ? 'th-TH' : 'en-US'

  const handleBlockChange = (field, value) => {
    if (onBlockChange) onBlockChange(blockIndex, field, value)
  }

  const handleItemChange = (itemIndex, field, value) => {
    if (onItemChange) onItemChange(blockIndex, itemIndex, field, value)
  }

  const formatDate = (value) => (
    value ? new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
  )
  const blockTotal = block.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0
  const projectError = errors[`block_${blockIndex}_project`]
  const reasonError = errors[`block_${blockIndex}_reason`]

  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-4">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {blockIndex + 1}
          </span>
          <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">{t('projectBlock')} {blockIndex + 1}</span>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => onRemoveBlock(blockIndex)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ border: 'none', background: 'transparent' }}
            title={t('removeProject')}
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('delete')}</span>
          </button>
        )}
      </div>

      <div className="p-3.5 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {editable ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('projectBlock')} <span className="text-red-500">*</span>
                </span>
                <select
                  value={block.project_id || ''}
                  onChange={(e) => handleBlockChange('project_id', e.target.value)}
                  className={`h-10 w-full rounded-xl border px-3 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                    projectError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <option value="">{t('selectProject')}</option>
                  {projects.map((p, i) => (
                    <option key={p.id || p.ID || i} value={p.id || p.ID}>
                      {p.projectname || p.project_name || p.projectName || p.ProjectName || p.name || p.title || `${t('projectBlock')} (${p.id || p.ID})`}
                    </option>
                  ))}
                </select>
                {projectError && <p className="mt-1 text-[11px] font-medium text-red-500">! {projectError}</p>}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('category')} <span className="text-red-500">*</span>
                </span>
                <select
                  value={block.reason_id || ''}
                  onChange={(e) => handleBlockChange('reason_id', e.target.value)}
                  className={`h-10 w-full rounded-xl border px-3 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                    reasonError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <option value="">{t('selectCategory')}</option>
                  {reasons.map((r, i) => (
                    <option key={r.id || r.ID || i} value={r.id || r.ID}>
                      {r.reasonname || r.reason_name || r.reasonName || r.ReasonName || r.name || r.title || `${t('category')} (${r.id || r.ID})`}
                    </option>
                  ))}
                </select>
                {reasonError && <p className="mt-1 text-[11px] font-medium text-red-500">! {reasonError}</p>}
              </label>
            </>
          ) : (
            <>
              <LabeledBox label={t('projectBlock')} value={block.project} />
              <LabeledBox label={t('category')} value={block.reason} />
            </>
          )}
        </div>

        <div className="mt-3.5 sm:mt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('subItems')}</span>
            {editable && (
              <button
                type="button"
                onClick={() => onAddItem(blockIndex)}
                className="petty-add-item-button flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" /> {t('addItem')}
              </button>
            )}
          </div>

          {editable ? (
            <>
              {/* ── Desktop: table grid ── */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 sm:block">
                <div className="grid grid-cols-[120px_1fr_120px_36px] gap-2 bg-slate-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>{t('date')}</span>
                  <span>{t('description')}</span>
                  <span className="text-right">{t('amount')} (฿)</span>
                  <span />
                </div>
                {block.items?.map((item, itemIndex) => {
                  const dateErr = errors[`block_${blockIndex}_item_${itemIndex}_date`]
                  const descErr = errors[`block_${blockIndex}_item_${itemIndex}_desc`]
                  const amtErr = errors[`block_${blockIndex}_item_${itemIndex}_amount`]
                  return (
                    <div
                      key={item.id || itemIndex}
                      className={`grid grid-cols-[120px_1fr_120px_36px] items-center gap-2 border-t border-slate-100 px-3 py-2 ${itemIndex % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                    >
                      <input
                        type="date"
                        value={item.date ? String(item.date).split('T')[0] : ''}
                        onChange={(e) => handleItemChange(itemIndex, 'date', e.target.value)}
                        className={`h-9 w-full rounded-lg border px-2 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${dateErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)}
                        placeholder={t('enterDescription')}
                        className={`h-9 w-full rounded-lg border px-2 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${descErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount === 0 ? '' : item.amount || ''}
                        onChange={(e) => handleItemChange(itemIndex, 'amount', e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="0.00"
                        className={`h-9 w-full rounded-lg border px-2 text-right text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${amtErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveItem(blockIndex, itemIndex)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        style={{ border: 'none', background: 'transparent' }}
                        title={t('removeItem')}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* ── Mobile: stacked cards ── */}
              <div className="space-y-2.5 sm:hidden">
                {block.items?.map((item, itemIndex) => {
                  const dateErr = errors[`block_${blockIndex}_item_${itemIndex}_date`]
                  const descErr = errors[`block_${blockIndex}_item_${itemIndex}_desc`]
                  const amtErr = errors[`block_${blockIndex}_item_${itemIndex}_amount`]
                  return (
                    <div key={item.id || itemIndex} className={`rounded-xl border px-3.5 py-3 ${itemIndex % 2 === 1 ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-white'}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">#{itemIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(blockIndex, itemIndex)}
                          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          style={{ border: 'none', background: 'transparent' }}
                          title={t('removeItem')}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                          {t('delete')}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-slate-400">{t('date')}</span>
                          <input
                            type="date"
                            value={item.date ? String(item.date).split('T')[0] : ''}
                            onChange={(e) => handleItemChange(itemIndex, 'date', e.target.value)}
                            className={`h-10 w-full rounded-lg border px-2.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${dateErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-slate-400">{t('amount')} (฿)</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount === 0 ? '' : item.amount || ''}
                            onChange={(e) => handleItemChange(itemIndex, 'amount', e.target.value ? parseFloat(e.target.value) : '')}
                            placeholder="0.00"
                            className={`h-10 w-full rounded-lg border px-2.5 text-right text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${amtErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                          />
                        </label>
                      </div>
                      <label className="mt-2.5 block">
                        <span className="mb-1 block text-[11px] font-semibold text-slate-400">{t('description')}</span>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)}
                          placeholder={t('enterDescription')}
                          className={`h-10 w-full rounded-lg border px-2.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${descErr ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-lg border border-slate-100 bg-white sm:block">
                <div className="grid grid-cols-[130px_1fr_120px] bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase text-slate-400">
                  <span>{t('date')}</span>
                  <span>{t('description')}</span>
                  <span className="text-right">{t('amount')}</span>
                </div>
                {block.items?.map((item) => (
                  <div key={item.id} className="grid grid-cols-[130px_1fr_120px] items-center border-t border-slate-100 px-3 py-2.5">
                    <div className="text-xs text-slate-500">{formatDate(item.date)}</div>
                    <div className="text-xs text-slate-700">{item.description}</div>
                    <div className="text-right text-xs font-bold text-slate-800">
                      {(Number(item.amount) || Number(item.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white sm:hidden">
                {block.items?.map((item, index) => (
                  <div key={item.id || index} className={`px-3 py-2.5 ${index > 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-5 text-slate-800">
                              {item.description || '-'}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-400">{formatDate(item.date)}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-base font-bold leading-5 text-primary-950">
                              {(Number(item.amount) || Number(item.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5 border-t border-slate-100 pt-3.5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-5">
          <div className="min-w-0">
            {editable ? (
              <FileInput
                label={t('receiptAttachment')}
                onUploadSuccess={(url) => handleBlockChange('receipt_url', url)}
              />
            ) : block.receipt_url ? (
              <a
                href={assetUrl(block.receipt_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {t('viewReceiptAttachment')}
              </a>
            ) : (
              <p className="text-xs text-slate-400">{t('noAttachment')}</p>
            )}
            {editable && block.receipt_url && (
              <p className="mt-1.5 text-[11px] font-semibold text-green-600">{t('uploadSuccess')}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end rounded-xl bg-primary/5 px-3.5 py-2.5 text-right sm:px-5 sm:py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t('projectTotal')}</p>
            <p className="mt-0.5 text-xl font-bold text-primary">
              {blockTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-semibold">฿</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
