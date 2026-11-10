// خصائص الجهاز: الوضع الليلي وتثبيت التطبيق على الشاشة الرئيسية
import { useCallback, useEffect, useState } from 'react'

const THEME = 'portal.theme'

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1322' : '#14284b')
  }, [dark])
  const toggle = useCallback(() => {
    setDark((d) => {
      try {
        localStorage.setItem(THEME, d ? 'light' : 'dark')
      } catch {
        /* ignore */
      }
      return !d
    })
  }, [])
  return { dark, toggle }
}

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED = 'portal.install.dismissed'

/** حالة تثبيت التطبيق: زر تثبيت مباشر على أندرويد وكروم، وتعليمات لآيفون */
export function useInstall() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED) === '1'
    } catch {
      return false
    }
  })
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  )
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const install = useCallback(async () => {
    if (!event) return
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setEvent(null)
  }, [event])
  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED, '1')
    } catch {
      /* ignore */
    }
  }, [])
  return { installed, canPrompt: !!event, ios, dismissed, install, dismiss }
}
