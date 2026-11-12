/**
 * Single source of truth for the AI access policy:
 * training is blocked; search/answer crawlers and user-triggered fetches are allowed.
 * `robots.txt` and the tests both read this module.
 */
export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no'

/** Crawlers that collect content for model training. Disallowed. */
export const TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'meta-externalagent',
  'cohere-ai',
] as const

/** Search, answer and user-triggered agents. Allowed on public pages. */
export const SEARCH_AND_USER_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
] as const

export const PRIVATE_PATHS = ['/admin', '/api/', '/preview', '/draft'] as const
/** Allowed inside the otherwise disallowed /api/ prefix: public agent endpoints. */
export const PUBLIC_API_PATHS = ['/api/mcp', '/api/webmcp/search'] as const
