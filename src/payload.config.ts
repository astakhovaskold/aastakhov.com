import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import {
  BlocksFeature,
  CodeBlock,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig, type CollectionConfig, UnauthorizedError } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { PostCategories } from './collections/PostCategories'
import { Topics } from './collections/Topics'
import { Posts } from './collections/Posts'
import { OpenSource } from './collections/OpenSource'
import { SiteSettings } from './globals/SiteSettings'
import { CV } from './globals/CV'
import { mcpOrigin, oauthCapabilities, publicReadCapabilities, verifyOAuthToken } from './lib/mcp-oauth'
import { McpOAuthCodes } from './collections/McpOAuthCodes'
import { CalloutBlock } from './collections/blocks/CalloutBlock'
import { MediaBlock } from './collections/blocks/MediaBlock'
import { DiagramBlock } from './collections/blocks/DiagramBlock'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * MCP keys are credentials, not editorial content. Keep each key visible and
 * manageable only by the Payload user it is attached to. The MCP endpoint
 * performs its own local lookup, so this does not affect key authentication.
 */
const secureMcpApiKeys = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
    read: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
    update: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
  },
  hooks: {
    ...collection.hooks,
    beforeChange: [
      ...(collection.hooks?.beforeChange ?? []),
      ({ data, req }) => {
        if (!req.user) {
          return data
        }

        // A user must never be able to mint a key owned by somebody else.
        return {
          ...data,
          user: req.user.id,
        }
      },
    ],
  },
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, PostCategories, Topics, Posts, OpenSource, McpOAuthCodes],
  globals: [SiteSettings, CV],
  localization: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    fallback: true,
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      BlocksFeature({
        blocks: [
          CodeBlock({
            defaultLanguage: 'typescript',
            languages: {
              typescript: 'TypeScript',
              javascript: 'JavaScript',
              tsx: 'TSX',
              jsx: 'JSX',
              html: 'HTML',
              css: 'CSS',
              json: 'JSON',
              shell: 'Bash / Shell',
              python: 'Python',
              rust: 'Rust',
              sql: 'SQL',
              markdown: 'Markdown',
              yaml: 'YAML',
            },
          }),
          CalloutBlock,
          MediaBlock,
          DiagramBlock,
        ],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  endpoints: [
    {
      path: '/mcp',
      method: 'options',
      handler: async (req) => {
        const origin = req.headers.get('origin') || '*'
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, MCP-Session-Id, x-requested-with',
            'Access-Control-Max-Age': '86400',
            Vary: 'Origin',
          },
        })
      },
    },
  ],
  sharp,
  plugins: [
    mcpPlugin({
      overrideAuth: async (req, getDefaultMcpAccessSettings) => {
        const authHeader = req.headers.get('Authorization')
        const bearer = authHeader?.replace(/^Bearer\s+/i, '').trim()
        const origin = mcpOrigin(req)
        const claims = bearer ? verifyOAuthToken(bearer, 'access', { expectedOrigin: origin }) : null

        if (claims) {
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: claims.sub,
              overrideAccess: false,
            })

            if (user) {
              return oauthCapabilities(user)
            }
          } catch {
            // User not found or invalid
          }
        }

        // If a bearer token was provided, try Payload's default MCP API key authentication
        if (bearer) {
          try {
            return await getDefaultMcpAccessSettings()
          } catch {
            // Provided bearer was neither a valid OAuth token nor a valid API key.
            // Throw UnauthorizedError so client knows its credentials failed rather than failing open.
            throw new UnauthorizedError()
          }
        }

        // Only genuinely unauthenticated public requests receive read-only capabilities for published content
        return publicReadCapabilities()
      },
      collections: {
        posts: {
          description:
            'Localized editorial posts. Read, create, and update content only; deleting posts is never permitted through MCP.',
          enabled: { create: true, delete: false, find: true, update: true },
        },
        projects: {
          description:
            'Localized project records. Read, create, and update content only; deleting projects is never permitted through MCP.',
          enabled: { create: true, delete: false, find: true, update: true },
        },
        'open-source': {
          description:
            'Localized open-source records. Read, create, and update content only; deleting records is never permitted through MCP.',
          enabled: { create: true, delete: false, find: true, update: true },
        },
        'post-categories': {
          description: 'Post taxonomy. Read-only reference data for assigning a post category.',
          enabled: { create: false, delete: false, find: true, update: false },
        },
        topics: {
          description: 'Topic hubs. Read-only reference data for assigning a post topic.',
          enabled: { create: false, delete: false, find: true, update: false },
        },
        media: {
          description: 'Media library. Manage and upload assets.',
          enabled: { create: true, delete: false, find: true, update: true },
        },
      },
      globals: {
        cv: {
          description: 'Localized CV content. Read and update only.',
          enabled: { find: true, update: true },
        },
        'site-settings': {
          description: 'Site-wide settings. Read-only through MCP.',
          enabled: { find: true, update: false },
        },
      },
      mcp: {
        handlerOptions: {
          maxDuration: 30,
        },
        serverOptions: {
          instructions:
            'Work only with the enabled content entities. Before any create or update, present a concise summary of the proposed change and wait for explicit user approval. Always specify the locale when editing localized fields. Never attempt deletion.',
          serverInfo: {
            name: 'Askold content CMS',
            version: '1.0.0',
          },
        },
      },
      overrideApiKeyCollection: secureMcpApiKeys,
    }),
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      // Bypass Vercel Function request-size limits for uploads from the admin UI.
      clientUploads: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
