import { getLocale, getTranslations } from 'next-intl/server'

import { CopyMarkdownButton } from '@/components/site/copy-markdown-button'

export async function MarkdownExport(props: { kind: 'posts' | 'projects'; slug: string }) {
  const [t, locale] = await Promise.all([getTranslations('markdownExport'), getLocale()])
  const markdownUrl = `/${locale}/${props.kind}/${props.slug}.md`

  return (
    <div
      className="markdown-export"
      data-markdown-url={markdownUrl}
      data-tooldescription="Copy the full Markdown version of this page for use as LLM context"
      data-toolname="copy_page_markdown"
    >
      <CopyMarkdownButton
        copiedLabel={t('copied')}
        errorLabel={t('copyError')}
        label={t('copyMarkdown')}
        markdownUrl={markdownUrl}
      />
    </div>
  )
}
