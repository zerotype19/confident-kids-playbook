export const ALLOWED_ORIGIN = 'https://confident-kids-playbook.pages.dev'

interface CorsOptions {
  allowedMethods?: string[]
  allowedHeaders?: string[]
}

export function corsHeaders(options: CorsOptions | string = {}) {
  // Handle string parameter (for backward compatibility)
  if (typeof options === 'string') {
    return {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': options,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  // Handle object parameter
  const headers = new Headers({
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': options.allowedMethods?.join(', ') || 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': options.allowedHeaders?.join(', ') || 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'false',
    'Vary': 'Origin'
  });
  return headers;
}

export function handleOptions(request: Request) {
  console.log('🔄 Handling CORS preflight request:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  const corsHeaders = new Headers({
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
    'Vary': 'Origin'
  });

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
} 