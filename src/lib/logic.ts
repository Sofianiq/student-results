// منطق العرض الخالص (قابل للاختبار): ملخص السعي، رسالة النتيجة، رابط التحقق، الدخول المباشر من رمز QR
import type { CourseworkSnapshot, ResultSnapshot, StudentRecord } from './types'

export interface CourseworkSummary {
  count: number
  recorded: number
  sum: number
  max: number
  ratio: number | null
}

/** مجموع السعي المرصود ونسبته (المواد التي لم يُرصد سعيها لا تدخل في المجموع) */
export function courseworkSummary(s: CourseworkSnapshot): CourseworkSummary {
  const done = s.subjects.filter((x) => x.cw != null)
  const sum = done.reduce((a, x) => a + (x.cw ?? 0), 0)
  const max = done.reduce((a, x) => a + x.max, 0)
  return { count: s.subjects.length, recorded: done.length, sum: Math.round(sum * 100) / 100, max, ratio: max ? sum / max : null }
}

export type Mood = 'celebrate' | 'pass' | 'carry' | 'fail' | 'neutral'

export interface ResultMessage {
  mood: Mood
  /** العنوان الكبير */
  headline: string
  /** سطر التهنئة أو التشجيع */
  line: string
}

/** رسالة النتيجة: تهنئة مميزة للناجح، وتشجيع للمكمل، وعبارة محترمة للراسب */
export function resultMessage(r: ResultSnapshot): ResultMessage {
  const byDecision = r.statusText.includes('بقرار')
  switch (r.status) {
    case 'pass':
      return byDecision
        ? { mood: 'pass', headline: 'مبارك النجاح', line: 'تهنئك اللجنة الامتحانية بالنجاح، وتتمنى لك مزيداً من الاجتهاد والتفوق.' }
        : { mood: 'celebrate', headline: 'ألف مبارك النجاح', line: 'تهنئك عمادة الكلية واللجنة الامتحانية بنجاحك، وتتمنى لك دوام التفوق.' }
    case 'pass_r2':
      return { mood: 'celebrate', headline: 'ألف مبارك النجاح', line: 'اجتهدتَ فنلتَ؛ نبارك لك نجاحك في الدور الثاني ونتمنى لك دوام التوفيق.' }
    case 'pass_carry':
      return { mood: 'pass', headline: 'مبارك الانتقال إلى المرحلة التالية', line: 'نجحتَ بالتحميل؛ نتمنى لك التوفيق في اجتياز المواد المحمّلة.' }
    case 'carry':
      return { mood: 'carry', headline: 'مكمل', line: 'ما زالت الفرصة أمامك؛ نتمنى لك التوفيق في امتحانات الدور الثاني.' }
    case 'fail':
      return { mood: 'fail', headline: 'لم يحالفك الحظ هذه المرة', line: 'النجاح يبدأ بمحاولة جديدة؛ نتمنى لك التوفيق في العام القادم.' }
    case 'withdrawn':
      return { mood: 'neutral', headline: 'منسحب', line: '' }
    case 'postponed':
      return { mood: 'neutral', headline: 'مؤجل', line: '' }
    default:
      return { mood: 'neutral', headline: 'النتيجة غير مكتملة', line: 'ستظهر نتيجتك كاملة بعد اعتماد كل المواد.' }
  }
}

export const isPassing = (status: string) => status === 'pass' || status === 'pass_r2' || status === 'pass_carry'

/** رابط صفحة التحقق العامة في نظام اللجنة (يُشفَّر في رمز QR على النتيجة) */
export function verifyUrl(examUrl: string | null, code: string | null | undefined): string | null {
  if (!examUrl || !code) return null
  const base = examUrl.replace(/#.*$/, '')
  return `${base}#/verify/${code}`
}

/** يقرأ رقم الدخول والرمز من رابط البطاقة: ‎#/login?u=1234567&c=11112222 */
export function parseLoginHash(hash: string): { login: string; code: string } | null {
  const m = /^#\/login\?(.*)$/.exec(hash)
  if (!m) return null
  const q = new URLSearchParams(m[1])
  const login = (q.get('u') ?? '').trim()
  if (!login) return null
  return { login, code: (q.get('c') ?? '').trim() }
}

/** السجل المعروض افتراضياً: الأحدث (الخادم يرتبها من الأحدث إلى الأقدم) */
export const currentRecord = (records: StudentRecord[]): StudentRecord | undefined => records[0]

/** أحدث نتيجة منشورة في السجل: السنوية ثم الفصل الثاني ثم الأول */
export function latestResult(r: StudentRecord) {
  const res = r.items.filter((x) => x.kind === 'results')
  return res.find((x) => x.term === 0) ?? res.find((x) => x.term === 2) ?? res.find((x) => x.term === 1)
}
