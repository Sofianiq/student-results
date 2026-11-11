// حالة الجلسة: رمز الجلسة وآخر نسخة من البيانات تُحفظان في الجهاز ليفتح التطبيق فوراً ويعمل دون اتصال
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { itemKey } from './format'
import type { ApiResult, PortalData } from './types'

const TOKEN = 'portal.token'
const CACHE = 'portal.data'
const CACHE_AT = 'portal.data.at'
const SEEN = 'portal.seen'

const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const write = (k: string, v: string | null) => {
  try {
    if (v == null) localStorage.removeItem(k)
    else localStorage.setItem(k, v)
  } catch {
    /* التخزين معطل: يعمل التطبيق دون حفظ */
  }
}
const readJson = <T,>(k: string): T | null => {
  try {
    const raw = read(k)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export interface Session {
  token: string | null
  data: PortalData | null
  /** وقت آخر تحديث ناجح */
  syncedAt: string | null
  loading: boolean
  offline: boolean
  notice: string | null
  seen: Set<string>
  signIn: (login: string, code: string) => Promise<ApiResult>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  changeCode: (current: string, next: string) => Promise<ApiResult>
  markSeen: (keys: string[]) => void
}

export function useSession(): Session {
  const [token, setToken] = useState<string | null>(() => read(TOKEN))
  const [data, setData] = useState<PortalData | null>(() => (read(TOKEN) ? readJson<PortalData>(CACHE) : null))
  const [syncedAt, setSyncedAt] = useState<string | null>(() => read(CACHE_AT))
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [seen, setSeen] = useState<Set<string>>(() => new Set(readJson<string[]>(SEEN) ?? []))
  const busy = useRef(false)
  const lastSync = useRef(0)

  const store = useCallback((t: string | null, d: PortalData | null) => {
    const at = d ? new Date().toISOString() : null
    setToken(t)
    setData(d)
    setSyncedAt(at)
    write(TOKEN, t)
    write(CACHE, d ? JSON.stringify(d) : null)
    write(CACHE_AT, at)
  }, [])

  const refresh = useCallback(async () => {
    const t = read(TOKEN)
    if (!t || busy.current) return
    busy.current = true
    setLoading(true)
    try {
      const r = await api.me(t)
      if (r.ok) {
        lastSync.current = Date.now()
        store(t, r.data)
        setOffline(false)
      } else if (r.code === 'network') {
        setOffline(true)
      } else {
        // انتهت الجلسة أو أُغلقت البوابة: يعود الطالب لصفحة الدخول مع توضيح
        store(null, null)
        setNotice(r.error)
      }
    } finally {
      busy.current = false
      setLoading(false)
    }
  }, [store])

  // تحديث عند الفتح، وعند العودة للتطبيق، وعند عودة الاتصال
  useEffect(() => {
    void refresh()
    const onVisible = () => document.visibilityState === 'visible' && Date.now() - lastSync.current > 30_000 && void refresh()
    const onOnline = () => void refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [refresh])

  const signIn = useCallback(
    async (login: string, code: string): Promise<ApiResult> => {
      const r = await api.login(login, code)
      if (r.ok) {
        // أول دخول على هذا الجهاز: ما نُشر سابقاً لا يُعد «جديداً»
        if (!read(SEEN)) {
          const keys = r.data.records.flatMap((rec) => rec.items.map((it) => itemKey(rec, it)))
          write(SEEN, JSON.stringify(keys))
          setSeen(new Set(keys))
        }
        store(r.token, r.data)
        setNotice(null)
        setOffline(false)
        return { ok: true }
      }
      return r
    },
    [store],
  )

  const signOut = useCallback(async () => {
    const t = read(TOKEN)
    store(null, null)
    write(SEEN, null)
    setSeen(new Set())
    if (t) await api.logout(t)
  }, [store])

  const changeCode = useCallback(async (current: string, next: string): Promise<ApiResult> => {
    const t = read(TOKEN)
    if (!t) return { ok: false, code: 'session', error: 'انتهت الجلسة. سجّل الدخول مجدداً.' }
    const r = await api.changeCode(t, current, next)
    if (r.ok) setData((d) => (d ? { ...d, account: { ...d.account, code_changed: true } } : d))
    return r
  }, [])

  const markSeen = useCallback((keys: string[]) => {
    setSeen((prev) => {
      if (keys.every((k) => prev.has(k))) return prev
      const next = new Set(prev)
      keys.forEach((k) => next.add(k))
      write(SEEN, JSON.stringify([...next].slice(-300)))
      return next
    })
  }, [])

  return { token, data, syncedAt, loading, offline, notice, seen, signIn, signOut, refresh, changeCode, markSeen }
}
