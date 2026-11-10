import { ClipboardList, Hourglass } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RecordPicker } from '../components/RecordPicker'
import { Empty, Ring, Seg, cx } from '../components/ui'
import { SCOPE_LABEL, fmtNum, itemKey, timeAgo } from '../lib/format'
import { courseworkSummary } from '../lib/logic'
import type { CourseworkSnapshot, StudentRecord, Term } from '../lib/types'

export function Coursework({ records, index, onIndex, seen, markSeen }: { records: StudentRecord[]; index: number; onIndex: (i: number) => void; seen: Set<string>; markSeen: (k: string[]) => void }) {
  const rec = records[index]
  const items = rec.items.filter((x) => x.kind === 'coursework')
  const available = items.map((x) => x.term as Term)
  const [term, setTerm] = useState<Term>(available.includes(2) ? 2 : 1)
  useEffect(() => {
    setTerm(available.includes(2) ? 2 : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.student_id])
  const item = items.find((x) => x.term === term)

  useEffect(() => {
    if (item) markSeen([itemKey(rec, item)])
  }, [item, rec, markSeen])

  return (
    <div>
      <h1 className="display mb-3 text-3xl">السعي الفصلي</h1>
      <RecordPicker records={records} index={index} onChange={onIndex} />
      <Seg<Term>
        className="mb-4"
        value={term}
        onChange={setTerm}
        options={([1, 2] as Term[]).map((t) => {
          const it = items.find((x) => x.term === t)
          return { value: t, label: SCOPE_LABEL[t], dot: !!it && !seen.has(itemKey(rec, it)) }
        })}
      />
      {item && item.kind === 'coursework' ? (
        <CourseworkList key={`${rec.student_id}|${term}`} data={item.data} publishedAt={item.published_at} />
      ) : (
        <Empty icon={<Hourglass className="size-7" />} title="لم يُنشر السعي بعد">
          سيظهر سعيك في مواد {SCOPE_LABEL[term]} هنا فور نشره من اللجنة الامتحانية.
        </Empty>
      )}
    </div>
  )
}

function CourseworkList({ data, publishedAt }: { data: CourseworkSnapshot; publishedAt: string }) {
  const sum = courseworkSummary(data)
  return (
    <div className="space-y-3">
      <section className="hero rise rounded-3xl p-5">
        <div className="relative flex items-center gap-4">
          <Ring value={sum.recorded ? sum.sum : null} max={sum.max} size={104} stroke={9} label={`مجموع السعي ${fmtNum(sum.sum)} من ${sum.max}`}>
            <span className="tabular text-2xl font-bold">{sum.recorded ? fmtNum(sum.sum) : '—'}</span>
            <span className="tabular mt-1 text-xs text-white/70">من {sum.max || '—'}</span>
          </Ring>
          <div className="min-w-0">
            <div className="text-sm text-white/75">مجموع السعي المرصود</div>
            <div className="display text-2xl">
              {sum.recorded} <span className="text-base font-normal text-white/75">من {sum.count} مواد</span>
            </div>
            <div className="mt-1 text-xs text-white/60">نُشر {timeAgo(publishedAt)}</div>
          </div>
        </div>
      </section>

      <ul className="space-y-2.5">
        {data.subjects.map((s, i) => (
          <li key={s.name} className="card rise flex items-center gap-3.5 p-3.5" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <Ring value={s.cw} max={s.max} size={62} stroke={6} label={s.cw == null ? `${s.name}: لم يُرصد بعد` : `${s.name}: ${fmtNum(s.cw)} من ${s.max}`}>
              <span className={cx('tabular text-lg font-bold', s.cw == null && 'text-faint')}>{s.cw == null ? '—' : fmtNum(s.cw)}</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-snug">{s.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                {s.cw == null ? <span className="chip bg-surface-2 text-muted">لم يُرصد بعد</span> : <span className="tabular">السعي من {s.max}</span>}
                {s.units != null && <span className="tabular">{s.units} وحدات</span>}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold-2 transition-all duration-700" style={{ width: `${s.cw == null ? 0 : Math.min(100, (s.cw / s.max) * 100)}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2 px-1 pt-1 text-xs leading-relaxed text-muted">
        <ClipboardList className="mt-0.5 size-4 shrink-0 text-gold" />
        السعي المعروض هو مجموع السعي الفصلي لكل مادة كما رصده التدريسي. لأي استفسار راجع مقرر القسم.
      </p>
    </div>
  )
}
