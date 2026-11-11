import { describe, expect, it } from 'vitest'
import { demoData } from './demo'
import { formatCode, latinDigits, shortName, timeAgo } from './format'
import { courseworkSummary, gradeTally, latestResult, parseLoginHash, resultMessage, verifyUrl } from './logic'
import type { ResultSnapshot } from './types'

const result = (status: string, statusText = ''): ResultSnapshot => ({ v: 1, scope: 1, sections: [], overallLabel: null, units: 0, status, statusText, failedTitle: '', failed: [], round: 'الأول', rank: null })

describe('portal logic', () => {
  it('sums only the recorded coursework', () => {
    const s = courseworkSummary({ v: 1, subjects: [{ name: 'أ', units: 3, cw: 32, max: 40 }, { name: 'ب', units: 2, cw: 27, max: 30 }, { name: 'ج', units: 2, cw: null, max: 30 }] })
    expect(s).toEqual({ count: 3, recorded: 2, sum: 59, max: 70, ratio: 59 / 70 })
    expect(courseworkSummary({ v: 1, subjects: [] }).ratio).toBeNull()
  })

  it('congratulates passers and encourages the rest', () => {
    expect(resultMessage(result('pass', 'ناجح'))).toMatchObject({ mood: 'celebrate', headline: 'ألف مبارك النجاح' })
    expect(resultMessage(result('pass', 'ناجح بقرار')).mood).toBe('pass')
    expect(resultMessage(result('pass_r2')).mood).toBe('celebrate')
    expect(resultMessage(result('pass_carry')).mood).toBe('pass')
    expect(resultMessage(result('carry'))).toMatchObject({ mood: 'carry', headline: 'مكمل' })
    expect(resultMessage(result('fail')).mood).toBe('fail')
    expect(resultMessage(result('incomplete')).mood).toBe('neutral')
  })

  it('reads the direct sign-in link printed on the access card', () => {
    expect(parseLoginHash('#/login?u=1234567&c=11112222')).toEqual({ login: '1234567', code: '11112222' })
    expect(parseLoginHash('#/login?u=1234567')).toEqual({ login: '1234567', code: '' })
    expect(parseLoginHash('#/results')).toBeNull()
    expect(parseLoginHash('#/login?c=1')).toBeNull()
  })

  it('builds the public verification link', () => {
    expect(verifyUrl('https://x.github.io/Exam/', 'ABCD')).toBe('https://x.github.io/Exam/#/verify/ABCD')
    expect(verifyUrl('https://x.github.io/Exam/#/portal', 'ABCD')).toBe('https://x.github.io/Exam/#/verify/ABCD')
    expect(verifyUrl(null, 'ABCD')).toBeNull()
  })

  it('formats names, codes, digits and relative time', () => {
    expect(shortName('علي حسين كاظم الموسوي')).toBe('علي حسين')
    expect(formatCode('8843DAD56288CB68')).toBe('8843-DAD5-6288-CB68')
    expect(latinDigits('١٢٣۴۵')).toBe('12345')
    const now = Date.parse('2026-11-09T12:00:00Z')
    expect(timeAgo('2026-11-09T11:59:30Z', now)).toBe('قبل قليل')
    expect(timeAgo('2026-11-07T12:00:00Z', now)).toBe('منذ يومين')
  })

  it('never carries exam marks in the demo payload (same contract as the database)', () => {
    const d = demoData('1234567')
    expect(JSON.stringify(d)).not.toMatch(/final_theory|cw_theory|"total"|"average"/)
    expect(latestResult(d.records[0])?.data.status).toBe('pass')
    expect(latestResult(d.records[1])?.term).toBe(0)
  })

  it('gradeTally يعدّ التقديرات من الأعلى إلى الأدنى ويتجاهل الفارغ', () => {
    const row = (label: string) => ({ name: label + Math.random(), units: 2, label, note: 'ناجح', tone: 'ok' as const })
    const r = {
      sections: [
        { term: 1, label: null, units: 6, rows: [row('جيد'), row('امتياز'), row('—')] },
        { term: 2, label: null, units: 6, rows: [row('جيد'), row('ضعيف'), row('')] },
      ],
    } as unknown as ResultSnapshot
    expect(gradeTally(r)).toEqual([
      { label: 'امتياز', count: 1 },
      { label: 'جيد', count: 2 },
      { label: 'ضعيف', count: 1 },
    ])
  })
})
