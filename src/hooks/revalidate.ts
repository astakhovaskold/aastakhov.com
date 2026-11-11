import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { type ContentKind, applyRevalidation, getRevalidationTargets } from '@/lib/revalidate'

type WithSlug = { slug?: null | string }

function skip(context: Record<string, unknown> | undefined): boolean {
  return Boolean(context?.disableRevalidate)
}

export const revalidateAfterChange =
  (kind: ContentKind): CollectionAfterChangeHook =>
  ({ context, doc, previousDoc }) => {
    if (!skip(context)) {
      applyRevalidation(
        getRevalidationTargets(kind, [(doc as WithSlug)?.slug, (previousDoc as WithSlug)?.slug]),
      )
    }

    return doc
  }

export const revalidateAfterDelete =
  (kind: ContentKind): CollectionAfterDeleteHook =>
  ({ context, doc }) => {
    if (!skip(context)) {
      applyRevalidation(getRevalidationTargets(kind, [(doc as WithSlug)?.slug]))
    }

    return doc
  }

export const revalidateGlobalAfterChange =
  (kind: ContentKind): GlobalAfterChangeHook =>
  ({ context, doc }) => {
    if (!skip(context)) {
      applyRevalidation(getRevalidationTargets(kind))
    }

    return doc
  }
