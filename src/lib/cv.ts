import config from '@payload-config'
import { getPayload } from 'payload'

import type { Cv, Media } from '@/payload-types'

type PublicCv = Cv & {
  pdf: Media | null
}

function isMedia(value: Cv['pdf']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export async function getCV(): Promise<PublicCv | null> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }

  try {
    const payload = await getPayload({ config })
    const cv = await payload.findGlobal({
      slug: 'cv',
      depth: 1,
    })

    return {
      ...cv,
      pdf: isMedia(cv.pdf) ? cv.pdf : null,
    }
  } catch {
    return null
  }
}
