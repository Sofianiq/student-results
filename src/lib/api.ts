// الاتصال بقاعدة بيانات نظام اللجنة: أربع دوال فقط، دون أي مكتبة (طلبات مباشرة خفيفة)
import { DEMO_ACCOUNTS, demoData } from './demo'
import { latinDigits } from './format'
import type { ApiResult, PortalData } from './types'

// يقبل الرابط حتى لو نُسخ مع / أو /rest/v1 في نهايته
const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

/** بدون ربط قاعدة البيانات يعمل التطبيق ببيانات وهمية */
export const isDemo = !URL_ || !KEY

const NETWORK: ApiResult<never> = { ok: false, code: 'network', error: 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.' }

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | typeof NETWORK> {
  try {
    const res = await fetch(`${URL_}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    if (!res.ok) return NETWORK
    return (await res.json()) as T
  } catch {
    return NETWORK
  }
}

type LoginResult = ApiResult<{ token: string; data: PortalData }>
type MeResult = ApiResult<{ data: PortalData }>

// ---------- الوضع التجريبي ----------
const DEMO_CODES = 'portal.demo.codes'
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms))
const demoCodes = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_CODES) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}
const clean = (s: string) => latinDigits(s).replace(/\s/g, '')
const demoCodeOf = (login: string) => demoCodes()[login] ?? DEMO_ACCOUNTS.find((a) => a.login === login)?.code
const demoPayload = (login: string): PortalData => {
  const d = demoData(login)
  d.account.code_changed = !!demoCodes()[login]
  return d
}

export const api = {
  async login(login: string, code: string): Promise<LoginResult> {
    if (!isDemo) return rpc<LoginResult>('portal_login', { p_login: login, p_code: code })
    await wait()
    const l = clean(login).replace(/\D/g, '')
    if (!demoCodeOf(l) || demoCodeOf(l) !== clean(code)) return { ok: false, code: 'invalid', error: 'رقم الدخول أو الرمز السري غير صحيح.' }
    return { ok: true, token: `demo-${l}`, data: demoPayload(l) }
  },

  async me(token: string): Promise<MeResult> {
    if (!isDemo) return rpc<MeResult>('portal_me', { p_token: token })
    await wait(200)
    const l = token.replace('demo-', '')
    if (!demoCodeOf(l)) return { ok: false, code: 'session', error: 'انتهت الجلسة. سجّل الدخول مجدداً.' }
    return { ok: true, data: demoPayload(l) }
  },

  async changeCode(token: string, current: string, next: string): Promise<ApiResult> {
    if (!isDemo) return rpc<ApiResult>('portal_change_code', { p_token: token, p_current: current, p_new: next })
    await wait()
    const l = token.replace('demo-', '')
    if (demoCodeOf(l) !== clean(current)) return { ok: false, code: 'invalid', error: 'الرمز الحالي غير صحيح.' }
    if (clean(next).length < 6) return { ok: false, code: 'weak', error: 'الرمز الجديد يجب ألا يقل عن 6 خانات.' }
    localStorage.setItem(DEMO_CODES, JSON.stringify({ ...demoCodes(), [l]: clean(next) }))
    return { ok: true }
  },

  async logout(token: string): Promise<void> {
    if (!isDemo) await rpc('portal_logout', { p_token: token })
  },
}
