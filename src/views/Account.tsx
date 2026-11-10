import { Check, ChevronLeft, GraduationCap, History, IdCard, KeyRound, LogOut, Moon, Sun } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { InstallCard } from '../components/InstallCard'
import { Credit, Spinner, cx } from '../components/ui'
import { isDemo } from '../lib/api'
import { SCOPE_LABEL, SHIFT_LABEL, stageLabel, yearLabel } from '../lib/format'
import { isPassing, latestResult } from '../lib/logic'
import type { ApiResult, PortalData } from '../lib/types'

export function Account({
  data,
  dark,
  toggleTheme,
  onChangeCode,
  onSignOut,
  onOpenRecord,
}: {
  data: PortalData
  dark: boolean
  toggleTheme: () => void
  onChangeCode: (current: string, next: string) => Promise<ApiResult>
  onSignOut: () => void
  onOpenRecord: (index: number) => void
}) {
  const rec = data.records[0]
  const [confirmOut, setConfirmOut] = useState(false)
  return (
    <div className="space-y-3.5">
      <h1 className="display text-3xl">حسابي</h1>

      <section className="card rise p-5">
        <div className="flex items-center gap-4">
          <div className="hero flex size-16 shrink-0 items-center justify-center rounded-2xl">
            <GraduationCap className="relative size-8 text-gold-2" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold leading-snug">{rec.full_name}</div>
            <div className="text-sm text-muted">
              {rec.department} — {stageLabel(rec.stage)}
            </div>
            <div className="text-sm text-muted">{SHIFT_LABEL[rec.shift]}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-muted">
            <IdCard className="size-4" /> رقم الدخول
          </span>
          <b className="tabular tracking-widest" dir="ltr">
            {data.account.login_id}
          </b>
        </div>
      </section>

      {/* السجل الأكاديمي */}
      <section className="card rise overflow-hidden">
        <h2 className="flex items-center gap-2 px-5 pt-4 pb-2 font-bold">
          <History className="size-4.5 text-gold" /> السجل الأكاديمي
        </h2>
        <ul>
          {data.records.map((r, i) => {
            const res = latestResult(r)
            return (
              <li key={r.student_id} className="border-t border-line">
                <button type="button" className="flex w-full items-center gap-3 px-5 py-3.5 text-start" onClick={() => onOpenRecord(i)}>
                  <div className="min-w-0 flex-1">
                    <div className="tabular font-bold">{yearLabel(r.year)}</div>
                    <div className="text-xs text-muted">
                      {r.department} — {stageLabel(r.stage)}
                    </div>
                  </div>
                  {res && res.kind === 'results' ? (
                    <div className="text-end">
                      <span className={cx('chip', isPassing(res.data.status) ? 'bg-ok-soft text-ok' : res.data.status === 'carry' ? 'bg-warn-soft text-warn' : res.data.status === 'fail' ? 'bg-bad-soft text-bad' : 'bg-surface-2 text-muted')}>
                        {res.data.statusText}
                      </span>
                      <div className="mt-0.5 text-[11px] text-faint">{res.term === 0 ? 'النتيجة السنوية' : SCOPE_LABEL[res.term]}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-faint">لم تُعلن النتيجة</span>
                  )}
                  <ChevronLeft className="size-4 shrink-0 text-faint" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <ChangeCode onChangeCode={onChangeCode} changed={data.account.code_changed} />

      <section className="card rise divide-y divide-line">
        <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-start" onClick={toggleTheme} role="switch" aria-checked={dark}>
          <span className="flex items-center gap-3 font-semibold">
            {dark ? <Moon className="size-5 text-gold" /> : <Sun className="size-5 text-gold" />} الوضع الليلي
          </span>
          <span className={cx('relative h-7 w-12 rounded-full transition', dark ? 'bg-gold' : 'bg-line-strong')}>
            <span className={cx('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all')} style={{ insetInlineStart: dark ? 22 : 2 }} />
          </span>
        </button>
        <div className="px-5 py-4">
          <InstallCard always />
        </div>
      </section>

      {confirmOut ? (
        <div className="card rise p-4">
          <p className="mb-3 text-sm">هل تريد تسجيل الخروج من هذا الجهاز؟ ستحتاج رقم الدخول والرمز السري للدخول مجدداً.</p>
          <div className="flex gap-2">
            <button type="button" className="btn-soft flex-1" onClick={() => setConfirmOut(false)}>
              إلغاء
            </button>
            <button type="button" className="btn-soft flex-1 border-bad/40 text-bad" onClick={onSignOut}>
              <LogOut className="size-4" /> خروج
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-soft w-full text-bad" onClick={() => setConfirmOut(true)}>
          <LogOut className="size-4" /> تسجيل الخروج
        </button>
      )}

      <Credit className="pt-3" />
      <p className="text-center text-[11px] text-faint">الإصدار {__APP_VERSION__}{isDemo ? ' — وضع تجريبي' : ''}</p>
    </div>
  )
}

function ChangeCode({ onChangeCode, changed }: { onChangeCode: (current: string, next: string) => Promise<ApiResult>; changed: boolean }) {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next.trim().length < 6) return setError('الرمز الجديد يجب ألا يقل عن 6 خانات.')
    if (next !== again) return setError('الرمز الجديد وتأكيده غير متطابقين.')
    setBusy(true)
    setError(null)
    const r = await onChangeCode(cur, next)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setDone(true)
    setOpen(false)
    setCur('')
    setNext('')
    setAgain('')
  }

  return (
    <section className="card rise overflow-hidden">
      <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-start" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="flex items-center gap-3 font-semibold">
          <KeyRound className="size-5 text-gold" /> تغيير الرمز السري
        </span>
        <span className="text-xs text-muted">{changed || done ? 'رمز خاص بك ✓' : 'اختياري'}</span>
      </button>
      {done && !open && (
        <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm font-medium text-ok" role="status">
          <Check className="size-4" /> تم تغيير الرمز السري. استخدم الرمز الجديد في الدخول القادم.
        </div>
      )}
      {open && (
        <form onSubmit={submit} className="space-y-3 border-t border-line px-5 py-4" noValidate>
          <p className="text-sm text-muted">اختر رمزاً تتذكره (6 خانات على الأقل). بعد التغيير لا يعود الرمز المطبوع في البطاقة صالحاً.</p>
          <input className="field text-center" dir="ltr" type="password" autoComplete="current-password" placeholder="الرمز الحالي" aria-label="الرمز الحالي" value={cur} onChange={(e) => setCur(e.target.value)} />
          <input className="field text-center" dir="ltr" type="password" autoComplete="new-password" placeholder="الرمز الجديد" aria-label="الرمز الجديد" value={next} onChange={(e) => setNext(e.target.value)} />
          <input className="field text-center" dir="ltr" type="password" autoComplete="new-password" placeholder="تأكيد الرمز الجديد" aria-label="تأكيد الرمز الجديد" value={again} onChange={(e) => setAgain(e.target.value)} />
          {error && (
            <div role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy && <Spinner className="size-5" />} حفظ الرمز الجديد
          </button>
        </form>
      )}
    </section>
  )
}
