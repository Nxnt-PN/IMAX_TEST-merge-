export default function LabeledBox({ label, value, className = '', muted = false }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div className={`flex min-h-[34px] items-center rounded-lg border px-2.5 py-1.5 text-sm leading-snug text-slate-800 sm:min-h-9 sm:px-3 sm:py-2 ${
        muted ? 'border-slate-200 bg-slate-50/80 font-medium' : 'border-slate-200 bg-white'
      }`}>
        {value}
      </div>
    </label>
  )
}
