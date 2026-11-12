'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import {
  buildPaletteGroups,
  flattenGroups,
  isPaletteHotkey,
  moveIndex,
  type PaletteGroup,
  type SearchApiResponse,
} from '@/lib/command-palette'

const DEBOUNCE_MS = 150

export function CommandPalette() {
  const t = useTranslations('search')
  const locale = useLocale()
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<PaletteGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)

  const items = useMemo(() => flattenGroups(groups), [groups])

  const openPalette = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const closePalette = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteHotkey(event)) return
      event.preventDefault()
      if (dialogRef.current?.open) {
        closePalette()
      } else {
        openPalette()
      }
    }
    const onTrigger = () => openPalette()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-palette', onTrigger)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-palette', onTrigger)
    }
  }, [closePalette, openPalette])

  useEffect(() => {
    if (!open) return
    const needle = query.trim()
    if (!needle) {
      setGroups([])
      setActive(-1)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: needle, locale })
        const response = await fetch(`/api/webmcp/search?${params}`, { signal: controller.signal })
        const data = (await response.json()) as SearchApiResponse
        setGroups(buildPaletteGroups(data, needle, locale))
        setActive(-1)
      } catch {
        if (!controller.signal.aborted) setGroups([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [locale, open, query])

  const go = (index: number) => {
    const item = items[index]
    if (!item) return
    closePalette()
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => moveIndex(current, event.key === 'ArrowDown' ? 1 : -1, items.length))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(active >= 0 ? active : 0)
    }
  }

  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  let flatIndex = -1

  return (
    <dialog
      aria-label={t('title')}
      aria-modal="true"
      className="command-palette"
      onClick={(event) => {
        if (event.target === dialogRef.current) closePalette()
      }}
      onClose={() => {
        setOpen(false)
        setQuery('')
        setGroups([])
        returnFocusRef.current?.focus()
      }}
      ref={dialogRef}
    >
      <div className="command-palette-panel">
        <input
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={items.length > 0}
          aria-label={t('title')}
          autoComplete="off"
          className="command-palette-input"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={t('placeholder')}
          ref={inputRef}
          role="combobox"
          spellCheck={false}
          type="text"
          value={query}
        />

        <div aria-label={t('results')} className="command-palette-results" id={listId} role="listbox">
          {groups.map((group) => (
            <div className="command-palette-group" key={group.key} role="presentation">
              <div className="command-palette-group-title" role="presentation">
                {t(group.key)}
              </div>
              {group.items.map((item) => {
                flatIndex += 1
                const index = flatIndex
                return (
                  <div
                    aria-selected={index === active}
                    className="command-palette-item"
                    id={`${listId}-opt-${index}`}
                    key={item.id}
                    onClick={() => go(index)}
                    onMouseMove={() => setActive(index)}
                    role="option"
                  >
                    <span className="command-palette-item-title">{item.title}</span>
                    {item.description ? (
                      <span className="command-palette-item-desc">{item.description}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <p aria-live="polite" className="command-palette-status">
          {loading
            ? t('loading')
            : query.trim()
              ? items.length === 0
                ? t('noResults')
                : ''
              : t('hint')}
        </p>
      </div>
    </dialog>
  )
}

export function CommandPaletteTrigger() {
  const t = useTranslations('search')
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform))
  }, [])

  return (
    <button
      aria-haspopup="dialog"
      aria-label={t('triggerLabel')}
      className="search-trigger"
      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      type="button"
    >
      <span>{t('trigger')}</span>
      <kbd aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  )
}
