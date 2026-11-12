'use client'

import React, { useEffect } from 'react'

interface WebMcpProviderProps {
  locale?: string
}

export function WebMcpProvider({ locale = 'ru' }: WebMcpProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const tools = [
      {
        name: 'search_content',
        description:
          "Search articles, selected projects, and open-source repositories on Askold Astakhov's site.",
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Keywords to search for' },
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale (default current)' },
            type: {
              type: 'string',
              enum: ['all', 'posts', 'projects', 'opensource', 'cv'],
              description: 'Content section to filter',
            },
          },
          required: ['query'],
        },
        handler: async (args: { query: string; locale?: string; type?: string }) => {
          try {
            const l = args.locale || locale
            const t = args.type || 'all'
            const res = await fetch(`/api/webmcp/search?query=${encodeURIComponent(args.query)}&locale=${l}&type=${t}`)
            if (!res.ok) return { error: `Search failed: HTTP ${res.status}` }
            return await res.json()
          } catch (err: any) {
            return { error: err?.message || 'Network error performing search' }
          }
        },
      },
      {
        name: 'get_article',
        description: 'Retrieve full article content, description, and metadata by post slug.',
        parameters: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'The unique slug of the article' },
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale (default current)' },
          },
          required: ['slug'],
        },
        handler: async (args: { slug: string; locale?: string }) => {
          try {
            const l = args.locale || locale
            const res = await fetch(`/api/webmcp/search?slug=${encodeURIComponent(args.slug)}&locale=${l}`)
            if (!res.ok) return { error: `Article retrieval failed: HTTP ${res.status}` }
            return await res.json()
          } catch (err: any) {
            return { error: err?.message || 'Network error retrieving article' }
          }
        },
      },
      {
        name: 'get_post_markdown',
        description:
          'Retrieve the full article as Markdown with YAML frontmatter, ready to use as model context.',
        parameters: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'The unique slug of the article' },
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale (default current)' },
          },
          required: ['slug'],
        },
        handler: async (args: { slug: string; locale?: string }) => {
          try {
            const l = args.locale || locale
            const res = await fetch(`/${l}/posts/${encodeURIComponent(args.slug)}.md`)
            if (!res.ok) return { error: `Markdown retrieval failed: HTTP ${res.status}` }
            return await res.text()
          } catch (err: any) {
            return { error: err?.message || 'Network error retrieving markdown' }
          }
        },
      },
      {
        name: 'get_cv_summary',
        description: "Retrieve Askold Astakhov's professional background, role, summary, and tech stack.",
        parameters: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale' },
          },
        },
        handler: async (args?: { locale?: string }) => {
          try {
            const l = args?.locale || locale
            const res = await fetch(`/api/webmcp/search?type=cv&locale=${l}`)
            if (!res.ok) return { error: `CV retrieval failed: HTTP ${res.status}` }
            return await res.json()
          } catch (err: any) {
            return { error: err?.message || 'Network error retrieving CV' }
          }
        },
      },
      {
        name: 'list_recent_posts',
        description: 'Get the latest published articles and notes with titles and URLs.',
        parameters: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale' },
          },
        },
        handler: async (args?: { locale?: string }) => {
          try {
            const l = args?.locale || locale
            const res = await fetch(`/api/webmcp/search?type=posts&locale=${l}`)
            if (!res.ok) return { error: `Post listing failed: HTTP ${res.status}` }
            return await res.json()
          } catch (err: any) {
            return { error: err?.message || 'Network error listing posts' }
          }
        },
      },
      {
        name: 'list_projects',
        description: 'Get selected engineering and product projects by Askold Astakhov.',
        parameters: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['ru', 'en'], description: 'Language locale' },
          },
        },
        handler: async (args?: { locale?: string }) => {
          try {
            const l = args?.locale || locale
            const res = await fetch(`/api/webmcp/search?type=projects&locale=${l}`)
            if (!res.ok) return { error: `Project listing failed: HTTP ${res.status}` }
            return await res.json()
          } catch (err: any) {
            return { error: err?.message || 'Network error listing projects' }
          }
        },
      },
    ]

    // 1. Standard WebMCP via navigator.modelContext
    const nav = navigator as any
    if (nav?.modelContext?.registerTool) {
      try {
        for (const tool of tools) {
          nav.modelContext.registerTool(tool)
        }
      } catch (err) {
        console.warn('[WebMCP] Failed to register tools on navigator.modelContext:', err)
      }
    }

    // 2. Global modelContext fallback on window for in-browser agents and extensions
    const win = window as any
    if (!win.modelContext) {
      win.modelContext = {
        tools: new Map(),
        registerTool: (t: any) => win.modelContext.tools.set(t.name, t),
        getTools: () => Array.from(win.modelContext.tools.values()),
        callTool: async (name: string, params: any) => {
          const t = win.modelContext.tools.get(name)
          if (!t) throw new Error(`Tool ${name} not found`)
          return t.handler(params)
        },
      }
    }

    try {
      for (const tool of tools) {
        win.modelContext.registerTool(tool)
      }
    } catch {
      // Ignore if window registration fails
    }

    // Expose registry for DOM agent scrapers
    win.__WEBMCP_TOOLS__ = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }))
  }, [locale])

  return null
}
