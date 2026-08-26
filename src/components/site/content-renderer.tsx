import Link from 'next/link'
import React from 'react'

import type { Media } from '@/payload-types'

export type RichTextNode = {
  children?: RichTextNode[]
  fields?: {
    caption?: string | null
    doc?: Media | null
    linkType?: 'custom' | 'internal'
    newTab?: boolean
    url?: string
  }
  format?: number | string
  listType?: 'bullet' | 'check' | 'number'
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text?: string
  type: string
  url?: string
  value?: Media | { alt?: string | null; caption?: string | null; url?: string | null } | null
} & Record<string, unknown>

export type RichTextDocument = {
  root?: {
    children?: RichTextNode[]
  }
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatText(node: RichTextNode, children: React.ReactNode): React.ReactNode {
  const format = typeof node.format === 'number' ? node.format : 0
  let content = children

  if (format & 1) content = <strong>{content}</strong>
  if (format & 2) content = <em>{content}</em>
  if (format & 8) content = <code>{content}</code>
  if (format & 16) content = <sub>{content}</sub>
  if (format & 32) content = <sup>{content}</sup>
  if (format & 64) content = <span style={{ textDecoration: 'underline' }}>{content}</span>
  if (format & 128) content = <span style={{ textDecoration: 'line-through' }}>{content}</span>

  return content
}

function extractText(node?: RichTextNode): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return node.children?.map((child) => extractText(child)).join('') ?? ''
}

function extractMedia(node: RichTextNode): Media | null {
  if (isMedia(node.value)) return node.value
  if (isMedia(node.fields?.doc)) return node.fields.doc

  const { doc } = node as unknown as { doc?: unknown }
  return isMedia(doc) ? doc : null
}

function renderLink(node: RichTextNode, key: React.Key): React.ReactNode {
  const href = node.fields?.linkType === 'custom' ? node.fields.url : node.url || node.fields?.url
  const content = renderChildren(node.children)

  if (!href) return <React.Fragment key={key}>{content}</React.Fragment>
  if (href.startsWith('/')) return <Link href={href} key={key}>{content}</Link>

  return (
    <a href={href} key={key} rel={node.fields?.newTab ? 'noreferrer' : undefined} target={node.fields?.newTab ? '_blank' : undefined}>
      {content}
    </a>
  )
}

function renderNode(node: RichTextNode, key: React.Key): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const Tag = node.tag ?? 'h2'
      return <Tag key={key}>{renderChildren(node.children)}</Tag>
    }
    case 'paragraph':
      return <p key={key}>{renderChildren(node.children)}</p>
    case 'quote':
      return <blockquote key={key}>{renderChildren(node.children)}</blockquote>
    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      return <ListTag key={key}>{renderChildren(node.children)}</ListTag>
    }
    case 'listitem':
      return <li key={key}>{renderChildren(node.children)}</li>
    case 'link':
    case 'autolink':
      return renderLink(node, key)
    case 'horizontalrule':
      return <hr key={key} />
    case 'upload': {
      const media = extractMedia(node)
      if (!media?.url) return null
      const value = typeof node.value === 'object' && node.value !== null ? node.value : null
      const caption = node.fields?.caption || (value && 'caption' in value ? value.caption : null)

      return (
        <figure key={key}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={media.alt || ''} src={media.url} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      )
    }
    case 'code':
    case 'codeblock':
      return <pre key={key}><code>{extractText(node)}</code></pre>
    case 'linebreak':
      return <br key={key} />
    case 'text':
      return <React.Fragment key={key}>{formatText(node, node.text ?? '')}</React.Fragment>
    default:
      return <React.Fragment key={key}>{renderChildren(node.children)}</React.Fragment>
  }
}

function renderChildren(nodes?: RichTextNode[]): React.ReactNode {
  return nodes?.map((child, index) => renderNode(child, `${child.type}-${index}`)) ?? null
}

export function ContentRenderer(props: { content?: RichTextDocument | null }) {
  const nodes = props.content?.root?.children
  if (!nodes?.length) return null

  return <div className="content-renderer">{renderChildren(nodes)}</div>
}
