import React from 'react'

import { Link } from '@/i18n/navigation'
import { collectHeadings, type LexicalNodeLike } from '@/lib/lexical-headings'
import type { Media } from '@/payload-types'
import { CodeBlockRenderer } from './code-block-renderer'
import { CalloutRenderer } from './callout-renderer'
import { DiagramRenderer } from './diagram-renderer'

export type RichTextNode = {
  children?: RichTextNode[]
  fields?: {
    blockType?: string
    caption?: string | null
    chart?: string
    code?: string
    doc?: Media | null
    isLoopingVideo?: boolean
    language?: string
    linkType?: 'custom' | 'internal'
    media?: Media | { alt?: string | null; caption?: string | null; url?: string | null } | null
    newTab?: boolean
    text?: string
    title?: string | null
    type?: 'note' | 'quote' | 'tip' | 'warning'
    url?: string
  } & Record<string, unknown>
  format?: number | string
  language?: string
  listType?: 'bullet' | 'check' | 'number'
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text?: string
  type: string
  url?: string
  value?: Media | { alt?: string | null; caption?: string | null; mimeType?: string | null; url?: string | null } | null
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
  if (format & 8) content = <code className="inline-code">{content}</code>
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
  if (isMedia(node.fields?.media)) return node.fields.media

  const { doc } = node as unknown as { doc?: unknown }
  return isMedia(doc) ? doc : null
}

function renderLink(node: RichTextNode, key: React.Key): React.ReactNode {
  const href = node.fields?.linkType === 'custom' ? node.fields.url : node.url || node.fields?.url
  const content = renderChildren(node.children)

  if (!href) return <React.Fragment key={key}>{content}</React.Fragment>
  if (href.startsWith('/')) return <Link href={href} key={key}>{content}</Link>

  return (
    <a
      href={href}
      key={key}
      rel={node.fields?.newTab ? 'noreferrer' : undefined}
      target={node.fields?.newTab ? '_blank' : undefined}
    >
      {content}
    </a>
  )
}

function isVideoUrlOrMime(url?: string | null, mimeType?: string | null): boolean {
  if (mimeType?.startsWith('video/')) return true
  if (url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return true
  return false
}

function renderBlock(node: RichTextNode, key: React.Key): React.ReactNode {
  const fields = node.fields
  if (!fields) return null

  switch (fields.blockType) {
    case 'Code': {
      const code = fields.code || ''
      const language = fields.language || 'typescript'
      return <CodeBlockRenderer code={code} key={key} language={language} />
    }
    case 'callout': {
      const text = fields.text || ''
      const title = fields.title || null
      const type = fields.type || 'note'
      return <CalloutRenderer key={key} text={text} title={title} type={type} />
    }
    case 'diagram': {
      const chart = fields.chart || ''
      const caption = fields.caption || null
      return <DiagramRenderer caption={caption} chart={chart} key={key} />
    }
    case 'mediaBlock': {
      const media = extractMedia(node)
      if (!media?.url) return null
      const caption = fields.caption || media.alt || null
      const isVideo = fields.isLoopingVideo || isVideoUrlOrMime(media.url, media.mimeType)

      return (
        <figure className="article-media-figure" key={key}>
          {isVideo ? (
            <video
              autoPlay
              className="article-media-video"
              loop
              muted
              playsInline
              src={media.url}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={media.alt || ''} className="article-media-img" src={media.url} />
          )}
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      )
    }
    default:
      return null
  }
}

type HeadingIds = Map<LexicalNodeLike, string>

const NO_HEADING_IDS: HeadingIds = new Map()

function renderNode(node: RichTextNode, key: React.Key, ids: HeadingIds): React.ReactNode {
  switch (node.type) {
    case 'block':
      return renderBlock(node, key)
    case 'heading': {
      const Tag = node.tag ?? 'h2'
      const id = ids.get(node)

      if (!id) {
        return <Tag key={key}>{renderChildren(node.children, ids)}</Tag>
      }

      return (
        <Tag className="heading-anchored" id={id} key={key}>
          {renderChildren(node.children, ids)}
          <a aria-label={extractText(node).trim()} className="heading-anchor" href={`#${id}`}>
            #
          </a>
        </Tag>
      )
    }
    case 'paragraph': {
      const text = extractText(node).trim()
      // Skip empty paragraphs (e.g. from Enter keys in rich-text) to avoid artificial gaps
      const hasMeaningfulContent =
        text.length > 0 ||
        node.children?.some(
          (c) => c.type !== 'text' || (c.text && c.text.trim().length > 0),
        )

      if (!hasMeaningfulContent) {
        return null
      }

      return <p key={key}>{renderChildren(node.children, ids)}</p>
    }
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
      const isVideo = isVideoUrlOrMime(media.url, media.mimeType)

      return (
        <figure className="article-media-figure" key={key}>
          {isVideo ? (
            <video
              autoPlay
              className="article-media-video"
              loop
              muted
              playsInline
              src={media.url}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={media.alt || ''} className="article-media-img" src={media.url} />
          )}
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      )
    }
    case 'code':
    case 'codeblock': {
      const code = extractText(node)
      const language = (node.language as string) || 'plaintext'
      return <CodeBlockRenderer code={code} key={key} language={language} />
    }
    case 'linebreak':
      return <br key={key} />
    case 'text':
      return <React.Fragment key={key}>{formatText(node, node.text ?? '')}</React.Fragment>
    default:
      return <React.Fragment key={key}>{renderChildren(node.children, ids)}</React.Fragment>
  }
}

function renderChildren(nodes?: RichTextNode[], ids: HeadingIds = NO_HEADING_IDS): React.ReactNode {
  return nodes?.map((child, index) => renderNode(child, `${child.type}-${index}`, ids)) ?? null
}

export function ContentRenderer(props: { content?: RichTextDocument | null }) {
  const nodes = props.content?.root?.children
  if (!nodes?.length) return null

  const ids: HeadingIds = new Map(collectHeadings(props.content).map((entry) => [entry.node, entry.id]))

  return <div className="content-renderer">{renderChildren(nodes, ids)}</div>
}
