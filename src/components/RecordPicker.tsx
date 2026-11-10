import { yearLabel, stageLabel } from '../lib/format'
import type { StudentRecord } from '../lib/types'
import { cx } from './ui'

/** اختيار السنة الدراسية (يظهر فقط إذا كان للطالب سجل في أكثر من سنة) */
export function RecordPicker({ records, index, onChange }: { records: StudentRecord[]; index: number; onChange: (i: number) => void }) {
  if (records.length < 2) return null
  return (
    <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="السنة الدراسية">
      {records.map((r, i) => (
        <button
          key={r.student_id}
          type="button"
          role="tab"
          aria-selected={i === index}
          onClick={() => onChange(i)}
          className={cx(
            'shrink-0 rounded-2xl border px-4 py-2 text-start transition',
            i === index ? 'border-gold bg-gold-soft text-gold-text' : 'border-line bg-surface text-muted',
          )}
        >
          <div className="tabular text-sm font-bold">{yearLabel(r.year)}</div>
          <div className="text-xs">{stageLabel(r.stage)}</div>
        </button>
      ))}
    </div>
  )
}
