import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  buildBaselineHeaders,
  buildCspHeader,
  cspSourcePattern,
  toOrigin,
} from './src/lib/security-headers'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const blobStoreID = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]

const securityOptions = {
  analyticsOrigin: toOrigin(process.env.NEXT_PUBLIC_UMAMI_URL) ?? 'https://umami.aastakhov.com',
  isDev: process.env.NODE_ENV !== 'production',
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    minimumCacheTTL: 31536000,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/askold-avatar.jpeg',
      },
    ],
    ...(blobStoreID
      ? {
          remotePatterns: [
            {
              hostname: `${blobStoreID}.public.blob.vercel-storage.com`,
              protocol: 'https' as const,
            },
          ],
        }
      : {}),
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  async rewrites() {
    return {
      // Before pages: `/ru/posts/x.md` would otherwise match the `[slug]` page.
      beforeFiles: [
        {
          source: '/:locale(ru|en)/posts/:slug.md',
          destination: '/api/raw-markdown?kind=post&locale=:locale&slug=:slug',
        },
        {
          source: '/:locale(ru|en)/projects/:slug.md',
          destination: '/api/raw-markdown?kind=project&locale=:locale&slug=:slug',
        },
      ],
    }
  },
  async headers() {
    return [
      { source: '/:path*', headers: buildBaselineHeaders(securityOptions) },
      { source: cspSourcePattern(), headers: [buildCspHeader(securityOptions)] },
      {
        source: '/api/mcp/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type, Accept, MCP-Session-Id, x-requested-with' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/api/mcp',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type, Accept, MCP-Session-Id, x-requested-with' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
