import { useEffect } from 'react'
import { usePersistentState } from './usePersistentState'
import type { UnitSystem } from '@/lib/units'

export type Theme = 'light' | 'dark' | 'system'

/**
 * Units default to the locale's convention — the three imperial holdouts get °F, everyone
 * else gets °C — so the first render is usually already right.
 */
function defaultUnits(): UnitSystem {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const region = locale.split('-')[1]?.toUpperCase()
  return region === 'US' || region === 'LR' || region === 'MM' ? 'imperial' : 'metric'
}

export function useSettings() {
  const [units, setUnits] = usePersistentState<UnitSystem>('wx:units', defaultUnits())
  const [theme, setTheme] = usePersistentState<Theme>('wx:theme', 'system')

  // The resolved theme lives on <html> so CSS can switch tokens without a re-render, and
  // is recomputed when the OS preference changes while 'system' is selected.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#18191a' : '#f8f8f8')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return { units, setUnits, theme, setTheme }
}
