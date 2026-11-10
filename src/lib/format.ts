import type { Scope, Shift, StudentRecord } from './types'

const STAGES = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة']
export const stageLabel = (n: number) => `المرحلة ${STAGES[n - 1] ?? n}`
export const SHIFT_LABEL: Record<Shift, string> = { morning: 'الدراسة الصباحية', evening: 'الدراسة المسائية' }
export const SCOPE_LABEL: Record<Scope, string> = { 1: 'الفصل الأول', 2: 'الفصل الثاني', 0: 'النتيجة السنوية' }
export const yearLabel = (y: string) => y.replace('-', ' – ')

/** الاسم المختصر للتحية: أول اسمين */
export const shortName = (full: string) => full.trim().split(/\s+/).slice(0, 2).join(' ')

export function fmtNum(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n.toFixed(2)).toString()
}

const dateFmt = new Intl.DateTimeFormat('ar-IQ-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('ar-IQ-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
export const fmtDate = (iso: string | Date) => dateFmt.format(new Date(iso))
export const fmtDateTime = (iso: string | Date) => dateTimeFmt.format(new Date(iso))

/** «منذ يومين»، «قبل قليل»… */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 90) return 'قبل قليل'
  const m = Math.round(s / 60)
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.round(m / 60)
  if (h < 24) return h === 1 ? 'منذ ساعة' : h === 2 ? 'منذ ساعتين' : `منذ ${h} ساعات`
  const d = Math.round(h / 24)
  if (d < 30) return d === 1 ? 'أمس' : d === 2 ? 'منذ يومين' : `منذ ${d} أيام`
  return fmtDate(iso)
}

/** أرقام عربية/فارسية ← لاتينية (لحقول الدخول) */
export const latinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))

export const formatCode = (code: string) => code.replace(/(.{4})(?=.)/g, '$1-')

export const recordTitle = (r: StudentRecord) => `${r.department} — ${stageLabel(r.stage)}`

/** مفتاح فريد لعنصر منشور (لمعرفة الجديد الذي لم يره الطالب بعد) */
export const itemKey = (r: StudentRecord, it: { term: number; kind: string; published_at: string }) => `${r.student_id}|${it.kind}|${it.term}|${it.published_at}`
