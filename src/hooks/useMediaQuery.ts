import { useSyncExternalStore } from 'react'

/**
 * A media query as React state.
 *
 * Used to *move* a control rather than to duplicate it: rendering both a desktop and a
 * phone copy and hiding one with CSS would put two controls with the same accessible name
 * in the tree, which is worse for a screen reader than either layout alone.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** The phone layout's breakpoint, shared so the JS and the stylesheets cannot drift. */
export const PHONE = '(max-width: 600px)'

/** Honoured by the radar's playback loop, which is JS rather than CSS. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
