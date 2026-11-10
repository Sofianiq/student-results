// البيانات التي تعيدها دوال بوابة الطالب (portal_login / portal_me) في قاعدة بيانات نظام اللجنة الامتحانية.
// الطالب لا يستلم أي درجة امتحان: السعي كمجموع لكل مادة، والنتيجة بالتقديرات والحالة فقط.

export type Term = 1 | 2
/** 0 = النتيجة السنوية */
export type Scope = 0 | 1 | 2
export type Shift = 'morning' | 'evening'
export type Tone = 'ok' | 'carry' | 'fail' | 'muted'

export interface CourseworkSnapshot {
  v: 1
  subjects: { name: string; units: number | null; cw: number | null; max: number }[]
}

export interface ResultRow {
  name: string
  units: number | null
  label: string
  note: string
  tone: Tone
}

export interface ResultSnapshot {
  v: 1
  scope: Scope
  sections: { term: Term; label: string | null; units: number; rows: ResultRow[] }[]
  overallLabel: string | null
  units: number
  /** pass | pass_r2 | pass_carry | carry | fail | incomplete | none | withdrawn | postponed */
  status: string
  statusText: string
  failedTitle: string
  failed: string[]
  round: string
  rank: number | null
}

export type Item =
  | { term: Term; kind: 'coursework'; published_at: string; data: CourseworkSnapshot }
  | { term: Scope; kind: 'results'; published_at: string; data: ResultSnapshot }

export interface StudentRecord {
  student_id: string
  full_name: string
  /** مثل 2026-2027 */
  year: string
  department: string
  department_id: string
  stage: number
  shift: Shift
  status: 'active' | 'withdrawn' | 'postponed'
  verify_code: string
  items: Item[]
}

export interface Announcement {
  id: string
  title: string
  body: string
  level: 'info' | 'important' | 'urgent'
  pinned: boolean
  created_at: string
  created_by_name: string | null
  department: string | null
}

export interface PortalData {
  account: { login_id: string; code_changed: boolean }
  college: { university_name: string; college_name: string }
  notice: string | null
  exam_url: string | null
  records: StudentRecord[]
  announcements: Announcement[]
  server_time: string
}

export type ApiResult<T = unknown> = ({ ok: true } & T) | { ok: false; code: 'invalid' | 'locked' | 'closed' | 'session' | 'weak' | 'network'; error: string }
