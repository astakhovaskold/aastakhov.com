import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { PostCategories } from './collections/PostCategories'
import { Posts } from './collections/Posts'
import { OpenSource } from './collections/OpenSource'
import { SiteSettings } from './globals/SiteSettings'
import { CV } from './globals/CV'
import { oauthCapabilities, verifyOAuthToken } from './lib/mcp-oauth'
import { McpOAuthCodes } from './collections/McpOAuthCodes'

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
  collections: [Users, Media, Projects, PostCategories, Posts, OpenSource, McpOAuthCodes],
  globals: [SiteSettings, CV],
  localization: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    mcpPlugin({
      overrideAuth: async (req, getDefaultMcpAccessSettings) => {
        const bearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
        const claims = bearer ? verifyOAuthToken(bearer, 'access') : null

        if (!claims) {
          return getDefaultMcpAccessSettings()
        }

        const user = await req.payload.findByID({
          collection: 'users',
          id: claims.sub,
          overrideAccess: false,
        })

        return oauthCapabilities(user)
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
        media: {
          description: 'Media library. Read-only reference data for selecting existing assets.',
          enabled: { create: false, delete: false, find: true, update: false },
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
