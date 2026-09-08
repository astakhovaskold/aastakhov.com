import type { JsonLd } from '@/lib/structured-data'
import { serializeJsonLd } from '@/lib/structured-data'

export function StructuredData({ data }: { data: JsonLd | JsonLd[] }) {
  const graph = Array.isArray(data) ? data : [data]

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
      type="application/ld+json"
    />
  )
}
