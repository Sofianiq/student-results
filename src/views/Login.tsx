import { Eye, EyeOff, KeyRound, LogIn, QrCode, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Credit, Logo, Ornament, Spinner } from '../components/ui'
import { isDemo } from '../lib/api'
import { DEMO_ACCOUNTS } from '../lib/demo'
import { latinDigits } from '../lib/format'
import { parseLoginHash } from '../lib/logic'
import type { ApiResult } from '../lib/types'

export function Login({ onSignIn, notice, hash }: { onSignIn: (login: string, code: string) => Promise<ApiResult>; notice: string | null; hash: string }) {
  const [login, setLogin] = useState('')
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(notice)
  const codeRef = useRef<HTMLInputElement>(null)

  const submit = async (l: string, c: string) => {
    if (busy) return
    if (!l.trim() || !c.trim()) return setError('أدخل رقم الدخول والرمز السري كما في بطاقتك.')
    setBusy(true)
    setError(null)
    const r = await onSignIn(l, c)
    setBusy(false)
    if (!r.ok) setError(r.error)
  }

  // الدخول المباشر بمسح رمز QR المطبوع على البطاقة (عند فتح التطبيق أو وهو مفتوح على صفحة الدخول)
  useEffect(() => {
    const link = parseLoginHash(hash)
    if (!link) return
    // يُحذف الرمز من شريط العنوان فوراً حتى لا يبقى في سجل المتصفح
    history.replaceState(null, '', window.location.pathname + window.location.search)
    setLogin(link.login)
    setCode(link.code)
    if (link.code) void submit(link.login, link.code)
    else codeRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit(login, code)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="hero safe-top px-6 pt-10 pb-20 text-center">
        <div className="rise relative mx-auto flex max-w-md flex-col items-center">
          <Logo size={92} />
          <h1 className="display mt-5 text-4xl">بوابة الطالب</h1>
          <p className="mt-1 text-sm text-white/80">كلية التقنيات الصحية والطبية</p>
          <p className="text-xs text-white/60">جامعة السراج الأهلية</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-12 w-full max-w-md flex-1 px-4 pb-8">
        <form onSubmit={onSubmit} className="card rise p-5 sm:p-6" noValidate>
          <Ornament className="mb-4" />
          <h2 className="text-center text-lg font-bold">تسجيل الدخول</h2>
          <p className="mt-1 text-center text-sm text-muted">أدخل البيانات المطبوعة في بطاقة الدخول الخاصة بك</p>

          <label className="mt-5 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <UserRound className="size-4 text-gold" /> رقم الدخول
            </span>
            <input
              className="field tabular text-center tracking-[0.2em]"
              dir="ltr"
              inputMode="numeric"
              autoComplete="username"
              placeholder="• • • • • • •"
              value={login}
              onChange={(e) => setLogin(latinDigits(e.target.value).replace(/[^\d]/g, '').slice(0, 12))}
              aria-label="رقم الدخول"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <KeyRound className="size-4 text-gold" /> الرمز السري
            </span>
            <div className="relative">
              <input
                ref={codeRef}
                className="field tabular text-center tracking-[0.15em]"
                dir="ltr"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-label="الرمز السري"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 flex w-12 items-center justify-center text-faint" style={{ insetInlineStart: 0 }} aria-label={show ? 'إخفاء الرمز' : 'إظهار الرمز'}>
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </label>

          {error && (
            <div role="alert" className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-5" disabled={busy}>
            {busy ? <Spinner className="size-5" /> : <LogIn className="size-5" />}
            دخول
          </button>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gold-soft px-3.5 py-3 text-xs leading-relaxed text-gold-text">
            <QrCode className="mt-0.5 size-4 shrink-0" />
            <span>يمكنك أيضاً مسح رمز QR المطبوع في بطاقتك بكاميرا الهاتف للدخول مباشرة دون كتابة.</span>
          </div>
        </form>

        {isDemo && (
          <div className="card rise mt-4 p-4 text-sm">
            <div className="mb-2 font-bold text-gold-text">وضع تجريبي — بيانات وهمية</div>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.login} type="button" className="btn-soft justify-between" data-demo={a.login} onClick={() => void submit(a.login, a.code)}>
                  <span>{a.hint}</span>
                  <span className="tabular text-xs text-muted" dir="ltr">
                    {a.login} / {a.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="size-4 text-ok" /> بياناتك لا يراها غيرك — نسيت الرمز؟ راجع مقرر قسمك
        </p>
        <Credit className="mt-6" />
      </main>
    </div>
  )
}
