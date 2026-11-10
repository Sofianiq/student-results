import { Download, Share, Smartphone, X } from 'lucide-react'
import { useInstall } from '../lib/device'

/** دعوة لتثبيت التطبيق على الهاتف (تظهر في الرئيسية حتى يثبّته الطالب أو يغلقها) */
export function InstallCard({ always }: { always?: boolean }) {
  const { installed, canPrompt, ios, dismissed, install, dismiss } = useInstall()
  if (installed) return always ? <p className="text-sm text-ok">التطبيق مثبّت على هذا الجهاز ✓</p> : null
  if (!always && (dismissed || (!canPrompt && !ios))) return null
  return (
    <div className={always ? '' : 'card rise relative p-4'}>
      {!always && (
        <button type="button" onClick={dismiss} className="absolute top-3 flex size-8 items-center justify-center rounded-full text-faint" style={{ insetInlineEnd: 12 }} aria-label="إغلاق">
          <X className="size-4" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-navy-soft text-navy-text">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold">ثبّت التطبيق على هاتفك</div>
          {canPrompt ? (
            <>
              <p className="mt-0.5 text-sm text-muted">يفتح بلمسة واحدة من الشاشة الرئيسية ويعرض آخر بياناتك حتى دون اتصال.</p>
              <button type="button" className="btn-soft mt-3" onClick={() => void install()}>
                <Download className="size-4" /> تثبيت التطبيق
              </button>
            </>
          ) : ios ? (
            <p className="mt-0.5 text-sm leading-relaxed text-muted">
              في متصفح Safari اضغط زر المشاركة <Share className="inline size-4 align-text-bottom text-navy-text" /> ثم اختر «إضافة إلى الشاشة الرئيسية».
            </p>
          ) : (
            <p className="mt-0.5 text-sm leading-relaxed text-muted">من قائمة المتصفح (⋮) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</p>
          )}
        </div>
      </div>
    </div>
  )
}
