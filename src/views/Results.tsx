import { Award, BadgeCheck, Download, Hourglass, Medal, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RecordPicker } from '../components/RecordPicker'
import { Confetti, Empty, Logo, Ornament, Qr, Seal, Seg, cx, printPage } from '../components/ui'
import { SCOPE_LABEL, SHIFT_LABEL, fmtDate, formatCode, itemKey, stageLabel, yearLabel } from '../lib/format'
import { gradeTally, resultMessage, verifyUrl, type Mood } from '../lib/logic'
import type { PortalData, ResultSnapshot, Scope, StudentRecord, Tone } from '../lib/types'

export function Results({ data, index, onIndex, seen, markSeen }: { data: PortalData; index: number; onIndex: (i: number) => void; seen: Set<string>; markSeen: (k: string[]) => void }) {
  const rec = data.records[index]
  const items = rec.items.filter((x) => x.kind === 'results')
  const best = (): Scope => (items.some((x) => x.term === 0) ? 0 : items.some((x) => x.term === 2) ? 2 : 1)
  const [scope, setScope] = useState<Scope>(best)
  useEffect(() => {
    setScope(best())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.student_id])
  const item = items.find((x) => x.term === scope)

  useEffect(() => {
    if (item) markSeen([itemKey(rec, item)])
  }, [item, rec, markSeen])

  return (
    <div>
      <h1 className="display no-print mb-3 text-3xl">النتائج</h1>
      <div className="no-print">
        <RecordPicker records={data.records} index={index} onChange={onIndex} />
        <Seg<Scope>
          className="mb-4"
          value={scope}
          onChange={setScope}
          options={([1, 2, 0] as Scope[]).map((t) => {
            const it = items.find((x) => x.term === t)
            return { value: t, label: t === 0 ? 'السنوية' : SCOPE_LABEL[t], dot: !!it && !seen.has(itemKey(rec, it)) }
          })}
        />
      </div>
      {item && item.kind === 'results' ? (
        <ResultSheet key={`${rec.student_id}|${scope}`} rec={rec} result={item.data} publishedAt={item.published_at} data={data} />
      ) : (
        <Empty icon={<Hourglass className="size-7" />} title="لم تُعلن النتيجة بعد">
          ستظهر {scope === 0 ? 'نتيجتك السنوية' : `نتيجة ${SCOPE_LABEL[scope]}`} هنا فور اعتمادها ونشرها من اللجنة الامتحانية.
        </Empty>
      )}
    </div>
  )
}

const MOOD: Record<Mood, { wrap: string; title: string }> = {
  celebrate: { wrap: 'hero shine', title: 'text-gold-2' },
  pass: { wrap: 'hero', title: 'text-gold-2' },
  carry: { wrap: 'bg-warn-soft text-warn border border-warn/25', title: '' },
  fail: { wrap: 'bg-bad-soft text-bad border border-bad/20', title: '' },
  neutral: { wrap: 'bg-surface-2 text-muted border border-line', title: 'text-ink' },
}
const TONE: Record<Tone, string> = { ok: 'bg-ok-soft text-ok', carry: 'bg-warn-soft text-warn', fail: 'bg-bad-soft text-bad', muted: 'bg-surface-2 text-muted' }

/** ورقة النتيجة الإلكترونية: تقديرات وحالة فقط، بتصميم شهادة أكاديمية قابلة للحفظ PDF */
function ResultSheet({ rec, result, publishedAt, data }: { rec: StudentRecord; result: ResultSnapshot; publishedAt: string; data: PortalData }) {
  const msg = resultMessage(result)
  const link = verifyUrl(data.exam_url, rec.verify_code)
  const inactive = rec.status !== 'active'
  const festive = msg.mood === 'celebrate' || msg.mood === 'pass'
  const tally = gradeTally(result)

  // حجم خط الطباعة يتكيف مع طول النتيجة حتى تبقى في صفحة A4 واحدة
  // (النتيجة السنوية تُطبع بعمودين: فصل في كل عمود)
  const twoCols = result.sections.length > 1
  const longest = Math.max(0, ...result.sections.map((sec) => sec.rows.length))
  const lines = (twoCols ? Math.ceil(longest * 1.25) : longest) + 2 + result.failed.length
  useEffect(() => {
    const fs = lines <= 13 ? 10.5 : lines <= 16 ? 9.5 : lines <= 19 ? 8.5 : 8
    document.documentElement.style.setProperty('--print-fs', `${fs}px`)
    return () => void document.documentElement.style.removeProperty('--print-fs')
  }, [lines])

  return (
    <div className="space-y-3">
      <article className="card print-area rise overflow-hidden">
        {/* الترويسة */}
        <header className="hero px-5 pt-5 pb-4 text-center">
          <div className="relative flex flex-col items-center">
            <Logo size={58} />
            <div className="mt-2 text-sm font-semibold">{data.college.university_name}</div>
            <div className="text-xs text-white/75">{data.college.college_name} — اللجنة الامتحانية</div>
            <h2 className="display mt-2 text-2xl text-gold-2">نتيجة الامتحانات النهائية</h2>
          </div>
        </header>
        <div className="gold-rule" />

        {/* بيانات الطالب */}
        <dl className="print-tight grid grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 text-sm sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs text-muted">اسم الطالب</dt>
            <dd className="text-lg font-bold text-navy-text">{rec.full_name}</dd>
          </div>
          <Info label="القسم" value={rec.department} />
          <Info label="المرحلة" value={stageLabel(rec.stage).replace('المرحلة ', '')} />
          <Info label="الدراسة" value={SHIFT_LABEL[rec.shift].replace('الدراسة ', '')} />
          <Info label="العام الدراسي" value={yearLabel(rec.year)} />
          <Info label="النتيجة" value={SCOPE_LABEL[result.scope]} />
          <Info label="الدور الامتحاني" value={result.round} />
        </dl>

        {/* الحالة النهائية */}
        <section className={cx('print-tight relative mx-4 overflow-hidden rounded-2xl px-5 py-6 text-center', MOOD[msg.mood].wrap)}>
          {msg.mood === 'celebrate' && <Confetti />}
          <div className="relative">
            {festive && (
              <div className="no-print mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-white/10 text-gold-2 ring-1 ring-gold-2/50">
                <Award className="size-8" />
              </div>
            )}
            <div className={cx('display text-3xl', MOOD[msg.mood].title)}>{inactive ? result.statusText : msg.headline}</div>
            {!inactive && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-bold ring-1 ring-current/20">
                <BadgeCheck className="size-4" /> حالة الطالب: {result.statusText}
              </div>
            )}
            {msg.line && <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed opacity-90">{msg.line}</p>}
            {result.rank != null && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-sm font-bold text-[#1a1407]">
                <Medal className="size-4" /> {result.rank === 1 ? 'الأول على المرحلة' : `من الأوائل — الترتيب ${result.rank} على المرحلة`}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="mt-4 rounded-xl bg-white/60 px-4 py-3 text-start text-sm dark:bg-black/20">
                <div className="mb-1 font-bold">{result.failedTitle}</div>
                <ul className="list-disc space-y-0.5 ps-5">
                  {result.failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* المواد */}
        <div className={cx(twoCols && 'print-cols')}>
        {result.sections.map((sec) => (
          <section key={sec.term} className="px-4 pt-4">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h3 className="font-bold text-navy-text">{SCOPE_LABEL[sec.term]}</h3>
              {sec.label && (
                <span className="text-xs text-muted">
                  التقدير العام: <b className="text-gold-text">{sec.label}</b>
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 text-xs text-muted">
                    <th className="px-3 py-2 text-start font-semibold">المادة الدراسية</th>
                    <th className="w-11 px-0.5 py-2 text-center font-semibold">الوحدات</th>
                    <th className="w-[4.25rem] px-0.5 py-2 text-center font-semibold">التقدير</th>
                    <th className="w-[4.75rem] px-1 py-2 text-center font-semibold">النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.rows.map((r) => (
                    <tr key={r.name} className="border-t border-line">
                      <td className="px-3 py-2.5 font-medium leading-snug">{r.name}</td>
                      <td className="tabular px-1 py-2.5 text-center text-muted">{r.units ?? '—'}</td>
                      <td className="px-1 py-2.5 text-center font-bold text-navy-text">{r.label}</td>
                      <td className="px-1 py-2.5 text-center">
                        <span className={cx('chip px-2!', TONE[r.tone])}>{r.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        </div>

        {/* الخلاصة */}
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          <Summary label={result.scope === 0 ? 'التقدير العام السنوي' : 'التقدير العام'} value={result.overallLabel ?? '—'} />
          <Summary label="مجموع الوحدات" value={String(result.units)} />
        </div>

        {/* توزيع التقديرات */}
        {tally.length > 1 && (
          <div className="mx-4 mt-3 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-line px-3 py-2.5">
            <span className="text-xs text-muted">تقديراتك:</span>
            {tally.map((t) => (
              <span key={t.label} className="chip bg-navy-soft text-navy-text">
                {t.label} <b className="tabular rounded-full bg-surface px-1.5 text-[11px]">{t.count}</b>
              </span>
            ))}
          </div>
        )}

        <Ornament className="pt-5" />

        {/* الاعتماد: ختم اللجنة الامتحانية ورمز التحقق */}
        <footer className="px-5 pt-2 pb-5">
          <div className="flex items-center gap-4">
            <Seal size={118} className="-ms-1" />
            <div className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
              <div className="flex items-center gap-1.5 text-sm font-bold text-ok">
                <ShieldCheck className="size-4 shrink-0" /> نتيجة معتمدة من اللجنة الامتحانية
              </div>
              <div>
                رمز التحقق:{' '}
                <b className="tabular inline-block whitespace-nowrap text-ink" dir="ltr">
                  {formatCode(rec.verify_code)}
                </b>
              </div>
              <div>تاريخ الإعلان: {fmtDate(publishedAt)}</div>
            </div>
            {link && (
              <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
                <Qr value={link} size={84} />
                <span className="text-[10px] text-muted">امسح للتحقق</span>
              </div>
            )}
          </div>
          {link && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5 text-xs leading-relaxed text-muted sm:hidden">
              <Qr value={link} size={64} />
              <span>امسح الرمز للتحقق من صحة النتيجة من موقع اللجنة الامتحانية مباشرة.</span>
            </div>
          )}
          <p className="mt-3 text-center text-[11px] text-faint">نسخة إلكترونية للاطلاع؛ الوثيقة الرسمية تصدر من اللجنة الامتحانية.</p>
        </footer>
      </article>

      <div className="no-print flex gap-2">
        <button type="button" className="btn-soft flex-1" onClick={() => printPage(`نتيجة ${SCOPE_LABEL[result.scope]} — ${rec.full_name}`)}>
          <Download className="size-4" /> حفظ النتيجة PDF
        </button>
        {link && (
          <a className="btn-soft flex-1" href={link} target="_blank" rel="noreferrer">
            <ShieldCheck className="size-4" /> صفحة التحقق
          </a>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular truncate font-semibold">{value}</dd>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gold/40 bg-gold-soft px-4 py-3 text-center">
      <div className="text-xs text-gold-text">{label}</div>
      <div className="display tabular text-xl text-navy-text">{value}</div>
    </div>
  )
}
