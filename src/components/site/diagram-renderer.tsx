'use client'

import React, { useEffect, useId, useState } from 'react'

type DiagramProps = {
  caption?: string | null
  chart: string
}

export function DiagramRenderer({ caption, chart }: DiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const id = useId().replace(/:/g, '')

  useEffect(() => {
    let isMounted = true

    async function renderChart() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          themeVariables: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '13px',
            primaryColor: '#ffffff',
            primaryBorderColor: '#e2e8f0',
            primaryTextColor: '#0f172a',
            lineColor: '#94a3b8',
            arrowheadColor: '#64748b',
            clusterBkg: '#f8fafc',
            clusterBorder: '#e2e8f0',
            titleColor: '#334155',
            edgeLabelBackground: '#ffffff',
            tertiaryColor: '#f1f5f9',
            mainBkg: '#ffffff',
            nodeBorder: '#e2e8f0',
          },
          flowchart: {
            curve: 'basis',
            htmlLabels: true,
            padding: 16,
            nodeSpacing: 40,
            rankSpacing: 48,
            subGraphTitleMargin: { top: 14, bottom: 14 },
          },
        })

        const uniqueId = `mermaid-${id}`
        const { svg } = await mermaid.render(uniqueId, chart)
        if (isMounted) {
          setSvgHtml(svg)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to render diagram:', err)
          setHasError(true)
        }
      }
    }

    renderChart()

    return () => {
      isMounted = false
    }
  }, [chart, id])

  if (hasError) {
    return (
      <figure className="diagram-container diagram-fallback">
        <pre><code>{chart}</code></pre>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    )
  }

  return (
    <figure className="diagram-container">
      {svgHtml ? (
        <div
          className="diagram-svg"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <div className="diagram-loading">Loading diagram…</div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
