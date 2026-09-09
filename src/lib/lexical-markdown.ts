import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'

type LexicalEditorState = Parameters<typeof convertLexicalToMarkdown>[0]['data']

async function getRootEditorConfig(payload: Payload) {
  return editorConfigFactory.default({ config: payload.config })
}

export async function markdownToLexical(payload: Payload, markdown: string) {
  const editorConfig = await getRootEditorConfig(payload)
  return convertMarkdownToLexical({ editorConfig, markdown })
}

export async function lexicalToMarkdown(payload: Payload, data: LexicalEditorState) {
  const editorConfig = await getRootEditorConfig(payload)
  return convertLexicalToMarkdown({ data, editorConfig })
}
