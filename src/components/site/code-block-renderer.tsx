import React from 'react'
import { codeToHtml } from 'shiki'

import { CopyButton } from './copy-button'

type CodeBlockProps = {
  code: string
  filename?: string
  language?: string
}

const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Bash',
  css: 'CSS',
  diff: 'Diff',
  dockerfile: 'Dockerfile',
  go: 'Go',
  graphql: 'GraphQL',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  markdown: 'Markdown',
  md: 'Markdown',
  mdx: 'MDX',
  plaintext: 'Text',
  python: 'Python',
  py: 'Python',
  rust: 'Rust',
  scss: 'SCSS',
  sh: 'Shell',
  shell: 'Shell',
  sql: 'SQL',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
  yaml: 'YAML',
  yml: 'YAML',
}

export async function CodeBlockRenderer({ code, filename, language = 'plaintext' }: CodeBlockProps) {
  const cleanCode = code.replace(/\r\n/g, '\n').trimEnd()
  const langKey = (language || 'plaintext').toLowerCase()
  const displayLabel = filename || LANGUAGE_LABELS[langKey] || langKey.toUpperCase()

  let highlightedHtml: string
  try {
    highlightedHtml = await codeToHtml(cleanCode, {
      lang: langKey,
      theme: 'github-dark-default',
    })
  } catch {
    highlightedHtml = await codeToHtml(cleanCode, {
      lang: 'plaintext',
      theme: 'github-dark-default',
    })
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-language">{displayLabel}</span>
        <CopyButton text={cleanCode} />
      </div>
      <div
        className="code-block-content"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  )
}
