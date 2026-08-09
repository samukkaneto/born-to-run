'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PwaContextValue = {
  canInstall: boolean
  isInstalled: boolean
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isInstalled: false,
  install: async () => 'unavailable',
})

function subscribeToInstalledState(onChange: () => void) {
  const displayMode = window.matchMedia('(display-mode: standalone)')
  displayMode.addEventListener('change', onChange)
  window.addEventListener('appinstalled', onChange)
  return () => {
    displayMode.removeEventListener('change', onChange)
    window.removeEventListener('appinstalled', onChange)
  }
}

function getInstalledState() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true
}

export function usePwaInstall() {
  return useContext(PwaContext)
}

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const isInstalled = useSyncExternalStore(subscribeToInstalledState, getInstalledState, () => false)

  useEffect(() => {
    const onInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // A aplicação continua funcional no navegador se o registro falhar.
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!promptEvent) return 'unavailable' as const
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setPromptEvent(null)
    return outcome
  }, [promptEvent])

  const value = useMemo(
    () => ({ canInstall: Boolean(promptEvent), isInstalled, install }),
    [promptEvent, isInstalled, install],
  )

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}
