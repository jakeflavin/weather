import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchPlaces } from '../api/openMeteo'
import { describe, fromPlace, type Location } from '../hooks/useLocations'

/** Long enough that typing a city name is one request, short enough to feel immediate. */
const DEBOUNCE_MS = 220

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/**
 * Place search and the saved-location rail.
 *
 * The listbox is keyboard-first: `/` from anywhere focuses the field, arrows move the
 * highlight, Enter selects, Escape closes without changing the location.
 */
export function LocationBar({
  current,
  onSelect,
  saved,
  onSave,
  onRemove,
  isSaved,
  onLocate,
  locating,
}: {
  current: Location
  onSelect: (location: Location) => void
  saved: Location[]
  onSave: (location: Location) => void
  onRemove: (id: string) => void
  isSaved: boolean
  onLocate: () => void
  locating: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const debounced = useDebounced(query, DEBOUNCE_MS)

  const { data: places = [], isFetching } = useQuery({
    queryKey: ['places', debounced],
    queryFn: ({ signal }) => searchPlaces(debounced, signal),
    enabled: debounced.trim().length >= 2,
    staleTime: 60 * 60 * 1000,
  })

  useEffect(() => setActive(0), [places])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.isContentEditable
      if (event.key === '/' && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const choose = (location: Location) => {
    onSelect(location)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open || !places.length) {
      if (event.key === 'Escape') inputRef.current?.blur()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % places.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + places.length) % places.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const place = places[active]
      if (place) choose(fromPlace(place))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const showList = open && debounced.trim().length >= 2

  return (
    <div className="locbar">
      <div className="search">
        <span className="search__glyph" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search a city, region or airport"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          // A click on a result must land before the blur closes the list.
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        <span className="search__kbd" aria-hidden="true">
          /
        </span>

        {showList && (
          <ul className="results" id={listId} role="listbox">
            {places.map((place, index) => {
              const location = fromPlace(place)
              return (
                <li
                  key={place.id}
                  role="option"
                  aria-selected={index === active}
                  data-active={index === active}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(location)}
                  >
                    <span>{place.name}</span>
                    <span className="dim">
                      {[place.admin1, place.country].filter(Boolean).join(', ')}
                    </span>
                    <span className="results__meta">
                      {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                    </span>
                  </button>
                </li>
              )
            })}
            {!places.length && (
              <li className="results__empty">
                {isFetching ? 'Searching…' : 'No places match that.'}
              </li>
            )}
          </ul>
        )}
      </div>

      <button type="button" className="button" onClick={onLocate} disabled={locating}>
        {locating ? 'Locating…' : 'Use my location'}
      </button>

      <button
        type="button"
        className="button button--subtle"
        onClick={() => (isSaved ? onRemove(current.id) : onSave(current))}
      >
        {isSaved ? 'Saved' : 'Save'}
      </button>

      <div className="chips">
        {saved.map((location) => (
          <span className="chip" key={location.id} data-current={location.id === current.id}>
            <button type="button" onClick={() => onSelect(location)}>
              {describe(location)}
            </button>
            <button
              type="button"
              className="chip__remove"
              onClick={() => onRemove(location.id)}
              aria-label={`Remove ${location.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
