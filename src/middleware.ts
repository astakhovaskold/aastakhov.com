import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // OAuth endpoints are protocol URLs, not localized pages. Prefixing them
  // with /ru or /en breaks the exact redirect URI registered by ChatGPT.
  matcher: ['/((?!admin|api|oauth|chatgpt|_next|_vercel|.*\\..*).*)'],
}
