const ALLOWED_ORIGIN = 'https://confident-kids-playbook.pages.dev'

interface CorsOptions {
  allowedMethods?: string[]
  allowedHeaders?: string[]
}

export function corsHeaders(options: CorsOptions = {}) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': options.allowedMethods?.join(', ') || 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': options.allowedHeaders?.join(', ') || 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  })
  return headers
}

export function handleOptions(request: Request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  const corsHeaders = new Headers({
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  })

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
} 