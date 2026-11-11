export const corsHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, MCP-Session-Id, x-requested-with',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
})

export const handleCorsPreflight = (request?: Request) => {
  const origin = request?.headers.get('origin') || '*'
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}

export const withCors = (
  response: Response,
  request?: Request,
  additionalHeaders?: Record<string, string>,
): Response => {
  const origin = request?.headers.get('origin') || '*'
  const headers = new Headers(response.headers)
  const cors = corsHeaders(origin)
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value)
  }

  if (additionalHeaders) {
    for (const [key, value] of Object.entries(additionalHeaders)) {
      headers.set(key, value)
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
