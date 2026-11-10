import { Award, ClipboardList, Home as HomeIcon, Moon, RefreshCw, Sun, UserRound, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Empty, Logo, Spinner, cx } from './components/ui'
import { useTheme } from './lib/device'
import { fmtDateTime, itemKey } from './lib/format'
import { useSession } from './lib/store'
import { Account } from './views/Account'
import { Coursework } from './views/Coursework'
import { Home } from './views/Home'
import { Login } from './views/Login'
import { Results } from './views/Results'

export type Tab = 'home' | 'coursework' | 'results' | 'account'
const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'الرئيسية', icon: <HomeIcon className="size-5.5" /> },
  { id: 'coursework', label: 'السعي', icon: <ClipboardList className="size-5.5" /> },
  { id: 'results', label: 'النتائج', icon: <Award className="size-5.5" /> },
  { id: 'account', label: 'حسابي', icon: <UserRound className="size-5.5" /> },
]

const tabOf = (hash: string): Tab => (TABS.find((t) => hash === `#/${t.id}`)?.id ?? 'home')
const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export default function App() {
  const s = useSession()
  const theme = useTheme()
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash)
  const tab = tabOf(hash)
  const [index, setIndex] = useState(0)

  const go = useCallback((t: Tab) => {
    window.location.hash = `#/${t}`
    window.scrollTo({ top: 0 })
  }, [])

  const records = s.data?.records ?? []
  const safeIndex = index < records.length ? index : 0
  useEffect(() => {
    if (index !== safeIndex) setIndex(safeIndex)
  }, [index, safeIndex])

  // عناصر منشورة لم يفتحها الطالب بعد (نقطة ذهبية على التبويب)
  const fresh = useMemo(() => {
    const out = { coursework: false, results: false }
    for (const r of records) for (const it of r.items) if (!s.seen.has(itemKey(r, it))) out[it.kind] = true
    return out
  }, [records, s.seen])

  if (!s.token) return <Login onSignIn={s.signIn} notice={s.notice} />

  if (!s.data) {
    return (
      <div className="hero flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
        <Logo size={84} />
        {s.offline ? (
          <>
            <p className="relative max-w-xs text-sm text-white/85">تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.</p>
            <button type="button" className="btn-soft relative" onClick={() => void s.refresh()}>
              <RefreshCw className="size-4" /> إعادة المحاولة
            </button>
          </>
        ) : (
          <Spinner className="relative size-7 text-gold-2" />
        )}
      </div>
    )
  }

  const data = s.data
  return (
    <div className="print-root min-h-dvh">
      <header className="hero no-print safe-top sticky top-0 z-30">
        <div className="relative mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Logo size={34} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="font-bold">بوابة الطالب</div>
            <div className="truncate text-[11px] text-white/70">{data.college.college_name}</div>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-full text-white/85 active:bg-white/10" onClick={() => void s.refresh()} aria-label="تحديث البيانات" disabled={s.loading}>
            <RefreshCw className={cx('size-5', s.loading && 'spin')} />
          </button>
          <button type="button" className="flex size-10 items-center justify-center rounded-full text-white/85 active:bg-white/10" onClick={theme.toggle} aria-label={theme.dark ? 'الوضع النهاري' : 'الوضع الليلي'}>
            {theme.dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
        <div className="gold-rule relative" />
      </header>

      {s.offline && (
        <div className="no-print flex items-center justify-center gap-2 bg-warn-soft px-4 py-2 text-center text-xs font-medium text-warn" role="status">
          <WifiOff className="size-4 shrink-0" />
          لا يوجد اتصال — تُعرض آخر نسخة محفوظة{s.syncedAt ? ` (${fmtDateTime(s.syncedAt)})` : ''}
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28">
        {records.length === 0 ? (
          <Empty icon={<UserRound className="size-7" />} title="لا توجد بيانات لهذا الحساب">
            راجع مقرر قسمك للتأكد من تسجيلك في السنة الدراسية الحالية.
          </Empty>
        ) : tab === 'home' ? (
          <Home data={data} seen={s.seen} go={go} />
        ) : tab === 'coursework' ? (
          <Coursework records={records} index={safeIndex} onIndex={setIndex} seen={s.seen} markSeen={s.markSeen} />
        ) : tab === 'results' ? (
          <Results data={data} index={safeIndex} onIndex={setIndex} seen={s.seen} markSeen={s.markSeen} />
        ) : (
          <Account
            data={data}
            dark={theme.dark}
            toggleTheme={theme.toggle}
            onChangeCode={s.changeCode}
            onSignOut={() => void s.signOut()}
            onOpenRecord={(i) => {
              setIndex(i)
              go('results')
            }}
          />
        )}
      </main>

      <nav className="no-print safe-bottom fixed inset-x-0 bottom-0 z-30 px-3 pb-2" aria-label="التنقل">
        <div className="mx-auto flex max-w-md items-stretch rounded-3xl border border-line bg-surface/95 p-1.5 shadow-[0_12px_40px_-12px_rgb(20_40_75/0.45)] backdrop-blur">
          {TABS.map((t) => {
            const active = t.id === tab
            const dot = (t.id === 'coursework' && fresh.coursework) || (t.id === 'results' && fresh.results)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
                aria-current={active ? 'page' : undefined}
                className={cx('relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition', active ? 'bg-navy text-white dark:bg-gold dark:text-[#1a1407]' : 'text-muted')}
              >
                <span className="relative">
                  {t.icon}
                  {dot && !active && <span className="absolute -top-0.5 size-2.5 rounded-full bg-gold ring-2 ring-surface" style={{ insetInlineEnd: -4 }} />}
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
