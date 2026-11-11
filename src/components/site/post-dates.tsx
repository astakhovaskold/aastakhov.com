import React from 'react'

type PostDatesProps = {
  locale: string
  modifiedAt?: null | string
  publishedAt?: null | string
  publishedText: (date: string) => string
  updatedText: (date: string) => string
}

function parse(value: null | string | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function PostDates({ locale, modifiedAt, publishedAt, publishedText, updatedText }: PostDatesProps) {
  const published = parse(publishedAt)
  const modified = parse(modifiedAt)
  const format = (date: Date) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC', year: 'numeric' }).format(date)
  const showModified = Boolean(modified && (!published || isoDay(modified) > isoDay(published)))

  if (!published && !showModified) return null

  return (
    <p className="post-detail-dates">
      {published ? (
        <time dateTime={published.toISOString()}>{publishedText(format(published))}</time>
      ) : null}
      {published && showModified && modified ? ' · ' : null}
      {showModified && modified ? (
        <time dateTime={modified.toISOString()}>{updatedText(format(modified))}</time>
      ) : null}
    </p>
  )
}
