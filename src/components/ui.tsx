import { Loader2 } from 'lucide-react'
import qrcode from 'qrcode-generator'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/** شعار الكلية داخل إطار ذهبي */
export function Logo({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full bg-white', className)}
      style={{ width: size, height: size, boxShadow: '0 0 0 2px var(--gold), 0 0 0 5px rgb(184 145 58 / 0.22)' }}
    >
      <img src="./logo.png" alt="شعار الكلية" width={size - 4} height={size - 4} className="rounded-full" />
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('spin', className)} aria-hidden />
}

/** فاصل زخرفي ذهبي */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center justify-center gap-2', className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-l from-gold to-transparent" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="size-2.5 rotate-45 border border-gold" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gradient-to-r from-gold to-transparent" />
    </div>
  )
}

/** حلقة تقدم (السعي): تمتلئ بحركة ناعمة عند الظهور */
export function Ring({ value, max, size = 64, stroke = 6, children, label }: { value: number | null; max: number; size?: number; stroke?: number; children?: ReactNode; label?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const ratio = value == null || !max ? 0 : Math.max(0, Math.min(1, value / max))
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(ratio))
    return () => cancelAnimationFrame(id)
  }, [ratio])
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        {value != null && (
          <circle
            className="ring-arc"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--gold)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - shown)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">{children}</div>
    </div>
  )
}

/** رمز QR بصيغة SVG */
export function Qr({ value, size = 96 }: { value: string; size?: number }) {
  const { n, d } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    const count = qr.getModuleCount()
    let path = ''
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) path += `M${c},${r}h1v1h-1z`
    return { n: count, d: path }
  }, [value])
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} shapeRendering="crispEdges" role="img" aria-label="رمز التحقق من النتيجة" className="rounded-md">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#14284b" />
    </svg>
  )
}

/** أزرار تبديل (فصل أول / فصل ثانٍ / سنوي) */
export function Seg<T extends string | number>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; disabled?: boolean; dot?: boolean }[]; className?: string }) {
  return (
    <div className={cx('flex rounded-2xl border border-line bg-surface-2 p-1', className)} role="tablist">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cx(
            'relative flex-1 rounded-xl px-2 py-2 text-sm font-semibold transition',
            o.value === value ? 'bg-surface text-navy-text shadow-sm' : 'text-muted',
            o.disabled && 'opacity-40',
          )}
        >
          {o.label}
          {o.dot && <span className="absolute top-1.5 size-2 rounded-full bg-gold" style={{ insetInlineEnd: 8 }} />}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="card rise flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-navy-soft text-navy-text">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <p className="mt-1.5 max-w-xs text-sm text-muted">{children}</p>}
    </div>
  )
}

/** قصاصات احتفال خفيفة تظهر مرة واحدة عند عرض نتيجة النجاح */
export function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        color: ['#d9b866', '#b8913a', '#ffffff', '#7fa6e8', '#f3e3b0'][i % 5],
        dx: `${((i * 53) % 120) - 60}px`,
        rot: `${((i * 97) % 720) - 360}deg`,
        dur: `${2.2 + ((i * 13) % 14) / 10}s`,
        delay: `${((i * 29) % 12) / 10}s`,
      })),
    [],
  )
  return (
    <div className="confetti pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <i key={i} style={{ left: b.left, background: b.color, ['--dx' as string]: b.dx, ['--rot' as string]: b.rot, ['--dur' as string]: b.dur, ['--delay' as string]: b.delay }} />
      ))}
    </div>
  )
}

export function Credit({ className }: { className?: string }) {
  return (
    <footer className={cx('text-center text-xs leading-relaxed text-faint', className)}>
      <div>جامعة السراج الأهلية — كلية التقنيات الصحية والطبية</div>
      <div>
        إعداد وتطوير: <span className="font-semibold text-muted">م.م سفيان محمد</span>
      </div>
    </footer>
  )
}
