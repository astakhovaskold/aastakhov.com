/**
 * Script to check all URLs listed in /sitemap.xml for 200 OK and absence of redirects.
 * Usage: pnpm tsx scripts/check-sitemap.ts [baseUrl]
 */

const baseUrl = process.argv[2] || process.env.SITE_URL || 'http://localhost:3000'

async function checkSitemap() {
  const sitemapUrl = `${baseUrl.replace(/\/+$/, '')}/sitemap.xml`
  console.log(`Fetching sitemap from: ${sitemapUrl}`)

  const res = await fetch(sitemapUrl)
  if (!res.ok) {
    console.error(`Failed to fetch sitemap: HTTP ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const xml = await res.text()
  const locRegex = /<loc>(.*?)<\/loc>/g
  const urls: string[] = []
  let match: RegExpExecArray | null

  while ((match = locRegex.exec(xml)) !== null) {
    if (match[1]) {
      urls.push(match[1].trim())
    }
  }

  if (urls.length === 0) {
    console.warn('Warning: No <loc> URLs found in sitemap.')
    return
  }

  console.log(`Found ${urls.length} URLs in sitemap. Validating...`)
  let failed = 0

  for (const url of urls) {
    // Replace domain with target baseUrl if testing against local dev
    const targetUrl = new URL(url)
    const localTarget = new URL(baseUrl)
    targetUrl.protocol = localTarget.protocol
    targetUrl.host = localTarget.host

    try {
      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
      })

      if (response.status === 200) {
        console.log(`[PASS 200] ${targetUrl.pathname}`)
      } else if (response.status >= 300 && response.status < 400) {
        console.error(`[FAIL REDIRECT ${response.status}] ${targetUrl.pathname} -> ${response.headers.get('location')}`)
        failed++
      } else {
        console.error(`[FAIL ${response.status}] ${targetUrl.pathname}`)
        failed++
      }
    } catch (err) {
      console.error(`[ERROR] ${targetUrl.pathname}: ${(err as Error).message}`)
      failed++
    }
  }

  console.log(`\nResults: ${urls.length - failed}/${urls.length} passed.`)
  if (failed > 0) {
    process.exit(1)
  }
}

checkSitemap().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
