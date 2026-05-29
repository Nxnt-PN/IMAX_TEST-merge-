import React, { useState } from 'react'
import { uploadFile } from '../../services/api'
import { useI18n } from '../../i18n'

export default function FileInput({ label, onUploadSuccess, className = '' }) {
  const { t } = useI18n()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'receipt')
      const data = await uploadFile(formData)

      setFileName(data.fileName)
      if (onUploadSuccess) {
        onUploadSuccess(data.url)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-semibold text-slate-400">{label}</span>}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
          {isUploading ? t('uploading') : t('chooseReceiptFile')}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*,.pdf"
          />
        </label>

        {fileName && <span className="max-w-[150px] truncate text-xs text-slate-600">{fileName}</span>}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
