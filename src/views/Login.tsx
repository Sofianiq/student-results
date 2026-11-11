import { Award, ClipboardList, Eye, EyeOff, KeyRound, LogIn, Megaphone, Moon, QrCode, ShieldCheck, Sun, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import { Logo, Ornament, Spinner, cx } from '../components/ui'
import { isDemo } from '../lib/api'
import { DEMO_ACCOUNTS } from '../lib/demo'
import { latinDigits } from '../lib/format'
import { parseLoginHash } from '../lib/logic'
import type { ApiResult } from '../lib/types'

/** عدد أرقام «رقم الدخول» المطبوع في البطاقة */
const LOGIN_DIGITS = 7

/**
 * صفحة الدخول «البوابة»: قوس ذهبي على سماء كحلية بزخرفة النجمة الثمانية،
 * وخانات رقم الدخول بشكل البطاقة المطبوعة ليطابق الطالب ما في يده بما على الشاشة.
 */
export function Login({
  onSignIn,
  notice,
  hash,
  dark,
  toggleTheme,
}: {
  onSignIn: (login: string, code: string) => Promise<ApiResult>
  notice: string | null
  hash: string
  dark: boolean
  toggleTheme: () => void
}) {
  const [login, setLogin] = useState('')
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(notice)
  // يتبدل مع كل محاولة فاشلة ليعيد تشغيل حركة الاهتزاز
  const [shake, setShake] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  const fail = (msg: string) => {
    setError(msg)
    setShake((n) => n + 1)
  }

  const submit = async (l: string, c: string) => {
    if (busy) return
    if (!l.trim() || !c.trim()) return fail('أدخل رقم الدخول والرمز السري كما في بطاقتك.')
    setBusy(true)
    setError(null)
    const r = await onSignIn(l, c)
    setBusy(false)
    if (!r.ok) fail(r.error)
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
    <div className="gate-page safe-top">
      <Lattice />
      <div className="gate-glow gate-glow-b" aria-hidden />

      <button type="button" onClick={toggleTheme} className="gate-theme" aria-label={dark ? 'الوضع النهاري' : 'الوضع الليلي'}>
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-5xl items-center gap-x-14 px-5 pt-12 pb-8 lg:grid-cols-[1fr_26rem] lg:pt-8">
        {/* لوحة التعريف (الشاشات العريضة) */}
        <aside className="rise hidden lg:block">
          <p className="text-sm font-semibold tracking-wide text-gold-2">جامعة السراج الأهلية — كلية التقنيات الصحية والطبية</p>
          <h2 className="display mt-3 text-5xl leading-[1.5]">
            بوابتك إلى <span className="gate-gold-text">سعيك ونتائجك</span>
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">تطّلع من هنا على سعيك الفصلي ونتيجة امتحاناتك النهائية فور إعلانها من اللجنة الامتحانية، من هاتفك أو حاسوبك.</p>
          <ul className="mt-8 space-y-4">
            <Feature icon={<ClipboardList className="size-5" />} title="السعي الفصلي" text="مجموع سعيك في كل مادة مع كشف قابل للحفظ PDF." />
            <Feature icon={<Award className="size-5" />} title="النتائج النهائية" text="نتيجتك بالتقديرات والحالة النهائية، مختومة بختم اللجنة الامتحانية." />
            <Feature icon={<Megaphone className="size-5" />} title="إعلانات الكلية" text="إعلانات اللجنة والقسم تصلك مباشرة." />
          </ul>
          <div className="mt-10 border-t border-white/12 pt-5 text-xs leading-relaxed text-white/55">
            <Trust />
            <p className="mt-2">
              إعداد وتطوير: <span className="font-semibold text-white/80">م.م سفيان محمد</span>
            </p>
          </div>
        </aside>

        <div className="relative w-full">
          {/* هالة ضوء ذهبية خلف قمة القوس */}
          <div className="gate-halo" aria-hidden />
          {/* البوابة: قوس يضم الشعار وبطاقة الدخول */}
          <section className={cx('gate rise', shake > 0 && (shake % 2 ? 'gate-shake-a' : 'gate-shake-b'))}>
            <header className="gate-dome">
              <LogoOrbit />
              <h1 className="display mt-2 text-[2.35rem] leading-[1.45] text-navy-text dark:text-gold-2">بوابة الطالب</h1>
              <p className="text-sm font-medium text-muted">كلية التقنيات الصحية والطبية</p>
              <p className="text-xs text-faint">جامعة السراج الأهلية</p>
            </header>

            <Ornament className="my-4" />

            <form onSubmit={onSubmit} noValidate>
              <h2 className="text-center text-base font-bold">تسجيل الدخول</h2>
              <p className="mt-0.5 text-center text-[13px] text-muted">اكتب ما في بطاقة الدخول الخاصة بك</p>

              <div className="mt-4">
                <FieldLabel icon={<UserRound className="size-4" />} htmlFor="gate-login">
                  رقم الدخول
                </FieldLabel>
                <DigitsField id="gate-login" value={login} onChange={setLogin} onComplete={() => codeRef.current?.focus()} />
              </div>

              <div className="mt-3.5">
                <FieldLabel icon={<KeyRound className="size-4" />} htmlFor="gate-code">
                  الرمز السري
                </FieldLabel>
                <div className="relative">
                  <input
                    id="gate-code"
                    ref={codeRef}
                    className="gate-code tabular"
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
              </div>

              {error && (
                <div role="alert" className="mt-3.5 rounded-xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-gate mt-4" disabled={busy}>
                {busy ? <Spinner className="size-5" /> : <LogIn className="size-5" />}
                دخول
              </button>
            </form>

            <div className="gate-threshold" aria-hidden />
          </section>

          <div className="rise mx-auto mt-7 flex max-w-[26rem] items-start gap-2.5 rounded-2xl bg-white/8 px-4 py-3 text-xs leading-relaxed text-white/85 ring-1 ring-white/15" style={{ animationDelay: '120ms' }}>
            <QrCode className="mt-0.5 size-4 shrink-0 text-gold-2" />
            <span>أو امسح رمز QR المطبوع في بطاقتك بكاميرا الهاتف لتدخل مباشرة دون كتابة.</span>
          </div>

          {isDemo && (
            <div className="rise mx-auto mt-3 max-w-[26rem] rounded-2xl bg-white/8 p-3.5 text-sm ring-1 ring-white/15" style={{ animationDelay: '160ms' }}>
              <div className="mb-2 font-bold text-gold-2">وضع تجريبي — بيانات وهمية</div>
              <div className="grid gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button key={a.login} type="button" className="gate-demo" data-demo={a.login} onClick={() => void submit(a.login, a.code)}>
                    <span>{a.hint}</span>
                    <span className="tabular text-xs text-white/60" dir="ltr">
                      {a.login} / {a.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-center text-xs text-white/70 lg:hidden">
            <Trust />
          </div>
          <footer className="mt-5 text-center text-xs leading-relaxed text-white/50 lg:hidden">
            <div>جامعة السراج الأهلية — كلية التقنيات الصحية والطبية</div>
            <div>
              إعداد وتطوير: <span className="font-semibold text-white/75">م.م سفيان محمد</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

function Trust() {
  return (
    <p className="flex items-center gap-1.5">
      <ShieldCheck className="size-4 shrink-0 text-gold-2" /> بياناتك لا يراها غيرك — نسيت الرمز؟ راجع مقرر قسمك
    </p>
  )
}

function FieldLabel({ icon, htmlFor, children }: { icon: ReactNode; htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
      <span className="text-gold">{icon}</span>
      {children}
    </label>
  )
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-gold-2 ring-1 ring-gold-2/40">{icon}</span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-white/70">{text}</span>
      </span>
    </li>
  )
}

/** رقم الدخول في خانات منفصلة كما في البطاقة المطبوعة (حقل واحد حقيقي شفاف فوق الخانات) */
function DigitsField({ id, value, onChange, onComplete, inputRef }: { id: string; value: string; onChange: (v: string) => void; onComplete?: () => void; inputRef?: RefObject<HTMLInputElement | null> }) {
  const [focused, setFocused] = useState(false)
  const active = Math.min(value.length, LOGIN_DIGITS - 1)
  return (
    <div className="digits" dir="ltr">
      {Array.from({ length: LOGIN_DIGITS }, (_, i) => (
        <span key={i} className={cx('digit tabular', value[i] && 'is-filled', focused && i === active && 'is-active', focused && i === active && !value[i] && 'is-caret')} aria-hidden>
          {value[i] ?? ''}
        </span>
      ))}
      <input
        id={id}
        ref={inputRef}
        className="digits-input"
        dir="ltr"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="username"
        aria-label="رقم الدخول"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const v = latinDigits(e.target.value).replace(/\D/g, '').slice(0, LOGIN_DIGITS)
          onChange(v)
          // بعد اكتمال الرقم ينتقل المؤشر إلى الرمز السري
          if (v.length === LOGIN_DIGITS && v !== value) onComplete?.()
        }}
      />
    </div>
  )
}

/** شعار الكلية داخل مدار ذهبي يدور ببطء */
function LogoOrbit() {
  return (
    <span className="relative inline-flex size-[7.25rem] items-center justify-center">
      <svg className="orbit absolute inset-0 size-full" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="56" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="1.5 6.5" strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x="57.6" y="1.6" width="4.8" height="4.8" fill="var(--gold)" transform={`rotate(${k * 45} 60 60) rotate(45 60 4)`} />
        ))}
      </svg>
      <Logo size={84} />
    </span>
  )
}

/** زخرفة النجمة الثمانية (الخاتم) تنساب ببطء في الخلفية */
function Lattice() {
  return (
    <div className="gate-lattice" aria-hidden>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="khatam" width="96" height="96" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#d9b866" strokeWidth="1">
              <rect x="28" y="28" width="40" height="40" />
              <rect x="28" y="28" width="40" height="40" transform="rotate(45 48 48)" />
              <path d="M48 0v19.7M48 76.3V96M0 48h19.7M76.3 48H96" />
              <path d="M0 -13 13 0 0 13 -13 0ZM96 -13 109 0 96 13 83 0ZM0 83 13 96 0 109 -13 96ZM96 83 109 96 96 109 83 96Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khatam)" />
      </svg>
    </div>
  )
}
