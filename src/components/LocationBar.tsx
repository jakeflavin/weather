import { useEffect, useId, useRef, useState } from 'react'
import { Button, Dim } from './controls.styled'
import {
  Bar,
  Chip,
  ChipRemove,
  Chips,
  ResultMeta,
  Results,
  ResultsEmpty,
  Search,
  SearchGlyph,
  SearchKbd,
} from './LocationBar.styled'
import { useQuery } from '@tanstack/react-query'
import { searchPlaces } from '@/api/openMeteo'
import { describe, fromPlace, label, type Location } from '@/hooks/useLocations'
import { PHONE, useMediaQuery } from '@/hooks/useMediaQuery'

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
 *
 * The options carry ids and the field points at the highlighted one with
 * `aria-activedescendant`, because focus never leaves the text field — without it the
 * highlight moves silently and a screen reader is told nothing at all. Each option is
 * itself the clickable element: an `option` may not contain a focusable descendant, and a
 * button inside one would also put every result in the tab order twice over.
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
  const phone = useMediaQuery(PHONE)
  const listId = useId()
  const optionId = (index: number) => `${listId}-option-${index}`
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
    <Bar>
      <Search>
        <SearchGlyph aria-hidden="true">
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
        </SearchGlyph>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && places.length ? optionId(active) : undefined}
          placeholder={phone ? 'Search a place' : 'Search a city, region or airport'}
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
        <SearchKbd aria-hidden="true">/</SearchKbd>

        {showList && (
          <Results id={listId} role="listbox" aria-label="Places">
            {places.map((place, index) => {
              const location = fromPlace(place)
              return (
                <li
                  key={place.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  data-active={index === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(location)}
                >
                  <span>{place.name}</span>
                  <Dim>{[place.admin1, place.country].filter(Boolean).join(', ')}</Dim>
                  {/* Kept as a plain decimal for the same reason as the station readout:
                      this is a coordinate people copy elsewhere. */}
                  <ResultMeta>
                    {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                  </ResultMeta>
                </li>
              )
            })}
            {!places.length && (
              <ResultsEmpty>{isFetching ? 'Searching…' : 'No places match that.'}</ResultsEmpty>
            )}
          </Results>
        )}
      </Search>

      {/* Save is the one that changes stored state and shows up elsewhere, so it is the
          one that carries the border; locating is a one-off that leaves nothing behind. */}
      <Button type="button" onClick={() => (isSaved ? onRemove(current.id) : onSave(current))}>
        {isSaved ? 'Saved' : 'Save'}
      </Button>

      <Button type="button" $subtle onClick={onLocate} disabled={locating}>
        {locating ? 'Locating…' : phone ? 'Locate' : 'Use my location'}
      </Button>

      <Chips>
        {saved.map((location) => (
          <Chip key={location.id} data-current={location.id === current.id}>
            <button type="button" title={describe(location)} onClick={() => onSelect(location)}>
              {label(location)}
            </button>
            <ChipRemove
              type="button"
              onClick={() => onRemove(location.id)}
              aria-label={`Remove ${location.name}`}
            >
              ×
            </ChipRemove>
          </Chip>
        ))}
      </Chips>
    </Bar>
  )
}
