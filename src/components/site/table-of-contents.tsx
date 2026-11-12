'use client'

import { useEffect, useRef, useState } from 'react'

import type { ExtractedHeading } from '@/lib/lexical-headings'

const MIN_HEADINGS = 2
/** Matches the CSS breakpoint where the TOC becomes a sticky side tree. */
const WIDE_QUERY = '(min-width: 1240px)'

export function TableOfContents(props: { headings: ExtractedHeading[]; title: string }) {
  const { headings, title } = props
  const [activeId, setActiveId] = useState<null | string>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  // Wide screens show the tree expanded; narrow screens keep a collapsed list.
  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY)
    const sync = () => {
      if (detailsRef.current) detailsRef.current.open = query.matches
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (headings.length < MIN_HEADINGS || typeof IntersectionObserver === 'undefined') return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)

        if (visible.length > 0) {
          // The topmost visible heading is the current section.
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0% -60% 0%' },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < MIN_HEADINGS) return null

  return (
    <nav aria-label={title} className="toc">
        <details ref={detailsRef}>
          <summary>{title}</summary>
          <ol>
          {headings.map((heading) => (
            <li className={heading.level === 3 ? 'toc-sub' : undefined} key={heading.id}>
              <a aria-current={activeId === heading.id ? 'location' : undefined} href={`#${heading.id}`}>
                {heading.text}
              </a>
            </li>
          ))}
          </ol>
        </details>
    </nav>
  )
}
