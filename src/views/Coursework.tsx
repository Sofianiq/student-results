import { Download, Hourglass, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RecordPicker } from '../components/RecordPicker'
import { Empty, Logo, Ornament, Ring, Seal, Seg, cx, printPage } from '../components/ui'
import { SCOPE_LABEL, SHIFT_LABEL, fmtDate, fmtNum, itemKey, stageLabel, timeAgo, yearLabel } from '../lib/format'
import { courseworkSummary } from '../lib/logic'
import type { CourseworkSnapshot, PortalData, StudentRecord, Term } from '../lib/types'

export function Coursework({ data, index, onIndex, seen, markSeen }: { data: PortalData; index: number; onIndex: (i: number) => void; seen: Set<string>; markSeen: (k: string[]) => void }) {
  const records = data.records
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
      <div className="no-print">
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
      </div>
      {item && item.kind === 'coursework' ? (
        <>
          <CourseworkList key={`${rec.student_id}|${term}`} data={item.data} publishedAt={item.published_at} onSave={() => printPage(`سعي ${SCOPE_LABEL[term]} — ${rec.full_name}`)} />
          <CourseworkSheet rec={rec} term={term} snapshot={item.data} publishedAt={item.published_at} data={data} />
        </>
      ) : (
        <Empty icon={<Hourglass className="size-7" />} title="لم يُنشر السعي بعد">
          سيظهر سعيك في مواد {SCOPE_LABEL[term]} هنا فور نشره من اللجنة الامتحانية.
        </Empty>
      )}
    </div>
  )
}

function CourseworkList({ data, publishedAt, onSave }: { data: CourseworkSnapshot; publishedAt: string; onSave: () => void }) {
  const sum = courseworkSummary(data)
  return (
    <div className="no-print space-y-3">
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

      {/* الاعتماد: ختم اللجنة الامتحانية */}
      <section className="card rise flex items-center gap-4 p-4">
        <Seal size={104} className="-ms-1" />
        <div className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ok">
            <ShieldCheck className="size-4 shrink-0" /> سعي معتمد من اللجنة الامتحانية
          </div>
          <div>تاريخ النشر: {fmtDate(publishedAt)}</div>
          <div className="mt-1">السعي المعروض هو مجموع السعي الفصلي لكل مادة كما رصده التدريسي. لأي استفسار راجع مقرر القسم.</div>
        </div>
      </section>

      <button type="button" className="btn-soft w-full" onClick={onSave}>
        <Download className="size-4" /> حفظ كشف السعي PDF
      </button>
    </div>
  )
}

/** كشف السعي للطباعة/الحفظ PDF: يظهر عند الطباعة فقط، بترويسة الكلية وختم اللجنة */
function CourseworkSheet({ rec, term, snapshot, publishedAt, data }: { rec: StudentRecord; term: Term; snapshot: CourseworkSnapshot; publishedAt: string; data: PortalData }) {
  const sum = courseworkSummary(snapshot)
  return (
    <article className="card print-area print-only overflow-hidden">
      <header className="hero px-5 pt-5 pb-4 text-center">
        <div className="relative flex flex-col items-center">
          <Logo size={58} />
          <div className="mt-2 text-sm font-semibold">{data.college.university_name}</div>
          <div className="text-xs text-white/75">{data.college.college_name} — اللجنة الامتحانية</div>
          <h2 className="display mt-2 text-2xl text-gold-2">كشف السعي الفصلي</h2>
        </div>
      </header>
      <div className="gold-rule" />
      <dl className="grid grid-cols-3 gap-x-4 gap-y-2 px-5 py-4 text-sm">
        <div className="col-span-3">
          <dt className="text-xs text-muted">اسم الطالب</dt>
          <dd className="text-lg font-bold text-navy-text">{rec.full_name}</dd>
        </div>
        <SheetInfo label="القسم" value={rec.department} />
        <SheetInfo label="المرحلة" value={stageLabel(rec.stage).replace('المرحلة ', '')} />
        <SheetInfo label="الدراسة" value={SHIFT_LABEL[rec.shift].replace('الدراسة ', '')} />
        <SheetInfo label="العام الدراسي" value={yearLabel(rec.year)} />
        <SheetInfo label="الفصل الدراسي" value={SCOPE_LABEL[term]} />
        <SheetInfo label="تاريخ النشر" value={fmtDate(publishedAt)} />
      </dl>
      <div className="mx-4 overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-xs text-muted">
              <th className="w-10 px-2 py-2 text-center font-semibold">ت</th>
              <th className="px-3 py-2 text-start font-semibold">المادة الدراسية</th>
              <th className="w-20 px-1 py-2 text-center font-semibold">الوحدات</th>
              <th className="w-24 px-1 py-2 text-center font-semibold">السعي</th>
              <th className="w-24 px-1 py-2 text-center font-semibold">من</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.subjects.map((s, i) => (
              <tr key={s.name} className="border-t border-line">
                <td className="tabular px-2 py-2 text-center text-muted">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="tabular px-1 py-2 text-center text-muted">{s.units ?? '—'}</td>
                <td className={cx('tabular px-1 py-2 text-center font-bold', s.cw == null ? 'text-muted' : 'text-navy-text')}>{s.cw == null ? 'لم يُرصد' : fmtNum(s.cw)}</td>
                <td className="tabular px-1 py-2 text-center text-muted">{s.max}</td>
              </tr>
            ))}
            <tr className="border-t border-line bg-gold-soft font-bold">
              <td colSpan={3} className="px-3 py-2.5 text-gold-text">
                مجموع السعي المرصود ({sum.recorded} من {sum.count} مواد)
              </td>
              <td className="tabular px-1 py-2.5 text-center text-navy-text">{sum.recorded ? fmtNum(sum.sum) : '—'}</td>
              <td className="tabular px-1 py-2.5 text-center text-navy-text">{sum.max || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Ornament className="pt-5" />
      <footer className="flex items-center gap-4 px-5 pt-2 pb-5">
        <Seal size={118} animate={false} />
        <div className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ok">
            <ShieldCheck className="size-4 shrink-0" /> سعي معتمد من اللجنة الامتحانية
          </div>
          <div>السعي المعروض هو مجموع السعي الفصلي لكل مادة كما رصده التدريسي.</div>
          <div className="mt-1 text-[11px] text-faint">نسخة إلكترونية للاطلاع؛ الوثيقة الرسمية تصدر من اللجنة الامتحانية.</div>
        </div>
      </footer>
    </article>
  )
}

function SheetInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular font-semibold">{value}</dd>
    </div>
  )
}
