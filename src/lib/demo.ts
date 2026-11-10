// وضع تجريبي: بيانات وهمية بالكامل تُستخدم عندما لا تكون قاعدة البيانات مربوطة (للمعاينة والاختبار)
import type { CourseworkSnapshot, PortalData, ResultRow, ResultSnapshot, StudentRecord } from './types'

export const DEMO_ACCOUNTS = [
  { login: '1234567', code: '12345678', hint: 'طالب ناجح' },
  { login: '7654321', code: '12345678', hint: 'طالب مكمل' },
]

const ok = (name: string, units: number, label: string, note = 'ناجح'): ResultRow => ({ name, units, label, note, tone: 'ok' })
const days = (n: number) => new Date(Date.now() - n * 86400_000).toISOString()

const cw1: CourseworkSnapshot = {
  v: 1,
  subjects: [
    { name: 'التشريح الشعاعي للرأس والأطراف العليا', units: 3, cw: 32, max: 40 },
    { name: 'الفيزياء الشعاعية', units: 3, cw: 36, max: 40 },
    { name: 'تقنيات التصوير الشعاعي', units: 3, cw: 28, max: 40 },
    { name: 'أجهزة الأشعة التقليدية', units: 3, cw: 34, max: 40 },
    { name: 'علم الأمراض', units: 2, cw: 30, max: 40 },
    { name: 'حقوق الإنسان والديمقراطية', units: 2, cw: 27, max: 30 },
    { name: 'اللغة الإنجليزية', units: 2, cw: null, max: 30 },
  ],
}

const passTerm1: ResultSnapshot = {
  v: 1,
  scope: 1,
  sections: [
    {
      term: 1,
      label: 'جيد جداً',
      units: 18,
      rows: [
        ok('التشريح الشعاعي للرأس والأطراف العليا', 3, 'جيد جداً'),
        ok('الفيزياء الشعاعية', 3, 'امتياز'),
        ok('تقنيات التصوير الشعاعي', 3, 'جيد'),
        ok('أجهزة الأشعة التقليدية', 3, 'جيد جداً'),
        ok('علم الأمراض', 2, 'جيد'),
        ok('حقوق الإنسان والديمقراطية', 2, 'امتياز'),
        ok('اللغة الإنجليزية', 2, 'جيد جداً'),
      ],
    },
  ],
  overallLabel: 'جيد جداً',
  units: 18,
  status: 'pass',
  statusText: 'ناجح',
  failedTitle: 'المواد المكمل فيها',
  failed: [],
  round: 'الأول',
  rank: 3,
}

const prevAnnual: ResultSnapshot = {
  v: 1,
  scope: 0,
  sections: [
    {
      term: 1,
      label: 'جيد',
      units: 14,
      rows: [ok('تشريح الهيكل العظمي', 3, 'جيد'), ok('الفيزياء العامة', 3, 'جيد جداً'), ok('الكيمياء العامة', 3, 'مقبول', 'ناجح بقرار'), ok('مبادئ الحاسوب', 2, 'امتياز'), ok('اللغة العربية', 3, 'جيد')],
    },
    {
      term: 2,
      label: 'جيد جداً',
      units: 13,
      rows: [ok('تشريح أجهزة الجسم', 3, 'جيد جداً'), ok('فيزياء الذرة', 3, 'جيد', 'ناجح (د2)'), ok('أسس التمريض', 4, 'جيد جداً'), ok('المصطلحات الطبية', 3, 'امتياز')],
    },
  ],
  overallLabel: 'جيد',
  units: 27,
  status: 'pass_r2',
  statusText: 'ناجح (الدور الثاني)',
  failedTitle: 'المواد المكمل فيها',
  failed: [],
  round: 'الأول والثاني',
  rank: null,
}

const carryTerm1: ResultSnapshot = {
  v: 1,
  scope: 1,
  sections: [
    {
      term: 1,
      label: 'متوسط',
      units: 18,
      rows: [
        ok('التشريح الشعاعي للرأس والأطراف العليا', 3, 'متوسط'),
        { name: 'الفيزياء الشعاعية', units: 3, label: 'ضعيف', note: 'مكمل', tone: 'carry' },
        ok('تقنيات التصوير الشعاعي', 3, 'جيد'),
        ok('أجهزة الأشعة التقليدية', 3, 'مقبول'),
        { name: 'علم الأمراض', units: 2, label: 'ضعيف', note: 'مكمل', tone: 'carry' },
        ok('حقوق الإنسان والديمقراطية', 2, 'جيد جداً'),
        ok('اللغة الإنجليزية', 2, 'متوسط'),
      ],
    },
  ],
  overallLabel: 'متوسط',
  units: 18,
  status: 'carry',
  statusText: 'مكمل',
  failedTitle: 'المواد المكمل فيها',
  failed: ['الفيزياء الشعاعية', 'علم الأمراض'],
  round: 'الأول',
  rank: null,
}

const record = (id: string, name: string, year: string, stage: number, items: StudentRecord['items']): StudentRecord => ({
  student_id: id,
  full_name: name,
  year,
  department: 'تقنيات الأشعة والسونار',
  department_id: 'd-rad',
  stage,
  shift: 'morning',
  status: 'active',
  verify_code: id.toUpperCase().padEnd(16, '7').slice(0, 16),
  items,
})

const base = (login: string, records: StudentRecord[]): PortalData => ({
  account: { login_id: login, code_changed: false },
  college: { university_name: 'جامعة السراج الأهلية', college_name: 'كلية التقنيات الصحية والطبية' },
  notice: 'تُعلن نتائج الفصل الثاني بعد اعتمادها من مجلس الكلية بإذن الله.',
  exam_url: null,
  records,
  announcements: [
    {
      id: 'a1',
      title: 'موعد امتحانات الدور الثاني',
      body: 'تبدأ امتحانات الدور الثاني يوم الأحد القادم حسب الجدول المعلن في لوحة إعلانات القسم. نتمنى للجميع التوفيق.',
      level: 'important',
      pinned: true,
      created_at: days(1),
      created_by_name: 'اللجنة الامتحانية',
      department: null,
    },
    {
      id: 'a2',
      title: 'استلام وثائق النجاح',
      body: 'يمكن للطلبة الناجحين مراجعة شعبة التسجيل لاستلام وثائق النجاح خلال أوقات الدوام الرسمي.',
      level: 'info',
      pinned: false,
      created_at: days(6),
      created_by_name: 'شعبة التسجيل',
      department: 'تقنيات الأشعة والسونار',
    },
  ],
  server_time: new Date().toISOString(),
})

export function demoData(login: string): PortalData {
  if (login === '7654321') {
    return base(login, [
      record('demo0002carry', 'زينب حيدر عبد الله جاسم', '2026-2027', 2, [
        { term: 1, kind: 'coursework', published_at: days(40), data: { v: 1, subjects: cw1.subjects.map((s, i) => ({ ...s, cw: s.cw == null ? 21 : Math.max(12, s.cw - 9 - (i % 3)) })) } },
        { term: 1, kind: 'results', published_at: days(2), data: carryTerm1 },
      ]),
    ])
  }
  return base(login, [
    record('demo0001pass', 'علي حسين كاظم الموسوي', '2026-2027', 2, [
      { term: 1, kind: 'coursework', published_at: days(40), data: cw1 },
      { term: 1, kind: 'results', published_at: days(2), data: passTerm1 },
    ]),
    record('demo0001prev', 'علي حسين كاظم الموسوي', '2025-2026', 1, [{ term: 0, kind: 'results', published_at: days(300), data: prevAnnual }]),
  ])
}
