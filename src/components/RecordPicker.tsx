import { yearLabel, stageLabel } from '../lib/format'
import type { StudentRecord } from '../lib/types'
import { cx } from './ui'

/**
 * التنقل بين مراحل الطالب (سجل لكل سنة دراسية): كل المراحل ظاهرة معاً دون تمرير،
 * الأحدث أولاً. يظهر فقط إذا كان للطالب أكثر من سجل.
 */
export function RecordPicker({ records, index, onChange }: { records: StudentRecord[]; index: number; onChange: (i: number) => void }) {
  if (records.length < 2) return null
  // حتى أربع مراحل في صف واحد؛ ما زاد ينزل إلى صف ثانٍ
  const cols = Math.min(records.length, 4)
  const compact = records.length > 3
  return (
    <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="tablist" aria-label="المرحلة الدراسية">
      {records.map((r, i) => (
        <button
          key={r.student_id}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`${stageLabel(r.stage)} — ${yearLabel(r.year)}`}
          onClick={() => onChange(i)}
          className={cx(
            'min-w-0 rounded-2xl border px-2 py-2 text-center transition',
            i === index ? 'border-gold bg-gold-soft text-gold-text shadow-sm' : 'border-line bg-surface text-muted',
          )}
        >
          <div className={cx('truncate font-bold', compact ? 'text-[13px]' : 'text-sm')}>{compact ? stageLabel(r.stage).replace('المرحلة ', '') : stageLabel(r.stage)}</div>
          <div className={cx('tabular truncate', compact ? 'text-[10.5px]' : 'text-xs')}>{yearLabel(r.year)}</div>
        </button>
      ))}
    </div>
  )
}
