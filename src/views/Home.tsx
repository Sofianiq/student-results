import { Award, BookOpenCheck, ChevronLeft, ClipboardList, KeyRound, Megaphone, Pin, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { InstallCard } from '../components/InstallCard'
import { Credit, Ring, cx } from '../components/ui'
import { SCOPE_LABEL, SHIFT_LABEL, fmtNum, itemKey, shortName, stageLabel, timeAgo, yearLabel } from '../lib/format'
import { courseworkSummary, isPassing, latestResult, resultMessage } from '../lib/logic'
import type { Announcement, PortalData } from '../lib/types'
import type { Tab } from '../App'

const HIDE_CODE_TIP = 'portal.tip.code'

export function Home({ data, seen, go }: { data: PortalData; seen: Set<string>; go: (t: Tab) => void }) {
  const rec = data.records[0]
  const result = latestResult(rec)
  const cw = [...rec.items].reverse().find((x) => x.kind === 'coursework')
  const cwSum = cw && cw.kind === 'coursework' ? courseworkSummary(cw.data) : null
  const msg = result && result.kind === 'results' ? resultMessage(result.data) : null
  const [tip, setTip] = useState(() => {
    try {
      return !data.account.code_changed && localStorage.getItem(HIDE_CODE_TIP) !== '1'
    } catch {
      return false
    }
  })
  const hideTip = () => {
    setTip(false)
    try {
      localStorage.setItem(HIDE_CODE_TIP, '1')
    } catch {
      /* ignore */
    }
  }
  const isNew = (it: { term: number; kind: string; published_at: string } | undefined) => !!it && !seen.has(itemKey(rec, it))

  return (
    <div className="space-y-3.5">
      {/* التحية */}
      <section className="hero rise rounded-3xl p-5">
        <div className="relative">
          <div className="text-sm text-white/75">أهلاً بك،</div>
          <h1 className="display text-3xl">{shortName(rec.full_name)}</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="chip bg-white/12 text-white ring-1 ring-white/20">{rec.department}</span>
            <span className="chip bg-white/12 text-white ring-1 ring-white/20">{stageLabel(rec.stage)}</span>
            <span className="chip bg-white/12 text-white ring-1 ring-white/20">{SHIFT_LABEL[rec.shift]}</span>
            <span className="chip tabular bg-gold/90 text-[#1a1407]">{yearLabel(rec.year)}</span>
          </div>
        </div>
      </section>

      {/* أحدث نتيجة */}
      {result && result.kind === 'results' && msg && (
        <button
          type="button"
          onClick={() => go('results')}
          className={cx(
            'rise relative block w-full overflow-hidden rounded-3xl p-5 text-start',
            isPassing(result.data.status) ? 'shine border border-gold/50 bg-gradient-to-l from-gold-soft to-surface' : 'card',
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cx('flex size-14 shrink-0 items-center justify-center rounded-2xl', isPassing(result.data.status) ? 'bg-gold text-[#1a1407]' : 'bg-navy-soft text-navy-text')}>
              {isPassing(result.data.status) ? <Award className="size-7" /> : <BookOpenCheck className="size-7" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted">
                {result.term === 0 ? 'النتيجة السنوية' : `نتيجة ${SCOPE_LABEL[result.term]}`} · {timeAgo(result.published_at)}
                {isNew(result) && <span className="chip bg-gold text-[#1a1407]">جديد</span>}
              </div>
              <div className={cx('display text-2xl', isPassing(result.data.status) ? 'text-gold-text' : 'text-ink')}>{msg.headline}</div>
              <div className="text-sm text-muted">اضغط لعرض نتيجتك كاملة</div>
            </div>
            <ChevronLeft className="size-5 shrink-0 text-faint" />
          </div>
        </button>
      )}

      {/* لمحة سريعة */}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => go('coursework')} className="card rise relative p-4 text-start">
          {isNew(cw) && <span className="chip absolute top-3 bg-gold text-[#1a1407]" style={{ insetInlineEnd: 12 }}>جديد</span>}
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-navy-soft text-navy-text">
            <ClipboardList className="size-5" />
          </div>
          <div className="font-bold">السعي الفصلي</div>
          {cwSum ? (
            <div className="mt-2 flex items-center gap-2.5">
              <Ring value={cwSum.recorded ? cwSum.sum : null} max={cwSum.max} size={46} stroke={5}>
                <span className="tabular text-[11px] font-bold">{cwSum.ratio == null ? '—' : `${Math.round(cwSum.ratio * 100)}%`}</span>
              </Ring>
              <div className="text-xs leading-relaxed text-muted">
                <div className="tabular font-semibold text-ink">
                  {fmtNum(cwSum.sum)} / {cwSum.max}
                </div>
                {cwSum.recorded} من {cwSum.count} مواد
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted">لم يُنشر بعد</div>
          )}
        </button>
        <button type="button" onClick={() => go('results')} className="card rise relative p-4 text-start">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold-text">
            <Award className="size-5" />
          </div>
          <div className="font-bold">النتائج</div>
          {result && result.kind === 'results' ? (
            <div className="mt-2 text-xs leading-relaxed text-muted">
              <div className="text-sm font-bold text-ink">{result.data.statusText}</div>
              {result.data.overallLabel && (
                <div>
                  التقدير العام: <b className="text-gold-text">{result.data.overallLabel}</b>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted">لم تُعلن بعد</div>
          )}
        </button>
      </div>

      {/* رسالة اللجنة */}
      {data.notice && (
        <div className="rise flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft px-4 py-3.5 text-sm leading-relaxed text-gold-text">
          <Sparkles className="mt-0.5 size-5 shrink-0" />
          <p className="whitespace-pre-line">{data.notice}</p>
        </div>
      )}

      {/* اقتراح تغيير الرمز */}
      {tip && (
        <div className="card rise relative flex items-start gap-3 p-4">
          <button type="button" onClick={hideTip} className="absolute top-3 flex size-8 items-center justify-center rounded-full text-faint" style={{ insetInlineEnd: 12 }} aria-label="إغلاق">
            <X className="size-4" />
          </button>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-navy-soft text-navy-text">
            <KeyRound className="size-5" />
          </div>
          <div className="min-w-0 flex-1 pe-6">
            <div className="font-bold">اجعل رمزك السري خاصاً بك</div>
            <p className="mt-0.5 text-sm text-muted">ما زلت تستخدم الرمز المطبوع في البطاقة. يمكنك تغييره متى شئت.</p>
            <button type="button" className="btn-soft mt-3" onClick={() => go('account')}>
              تغيير الرمز السري
            </button>
          </div>
        </div>
      )}

      {/* الإعلانات */}
      {data.announcements.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 px-1 font-bold">
            <Megaphone className="size-4.5 text-gold" /> الإعلانات
          </h2>
          <ul className="space-y-2.5">
            {data.announcements.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </ul>
        </section>
      )}

      <InstallCard />
      <Credit className="pt-4" />
    </div>
  )
}

const LEVEL: Record<Announcement['level'], { bar: string; chip: string; label: string }> = {
  urgent: { bar: 'bg-bad', chip: 'bg-bad-soft text-bad', label: 'عاجل' },
  important: { bar: 'bg-gold', chip: 'bg-gold-soft text-gold-text', label: 'مهم' },
  info: { bar: 'bg-line-strong', chip: 'bg-surface-2 text-muted', label: '' },
}

function AnnouncementCard({ a }: { a: Announcement }) {
  const [open, setOpen] = useState(a.pinned || a.level !== 'info')
  const lv = LEVEL[a.level]
  return (
    <li className="card rise relative overflow-hidden">
      <span className={cx('absolute inset-y-0 w-1', lv.bar)} style={{ insetInlineStart: 0 }} />
      <button type="button" className="block w-full px-4 py-3.5 ps-5 text-start" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="flex flex-wrap items-center gap-2">
          {a.pinned && <Pin className="size-3.5 text-gold" />}
          {lv.label && <span className={cx('chip', lv.chip)}>{lv.label}</span>}
          <span className="font-bold">{a.title}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {timeAgo(a.created_at)}
          {a.department ? ` · ${a.department}` : ' · الكلية'}
          {a.created_by_name ? ` · ${a.created_by_name}` : ''}
        </div>
        {open && a.body && <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink">{a.body}</p>}
      </button>
    </li>
  )
}
