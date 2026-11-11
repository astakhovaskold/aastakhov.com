import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const blobStoreID = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]

const nextConfig: NextConfig = {
  images: {
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
  async headers() {
    return [
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
