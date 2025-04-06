import { Env } from '../types';

export function corsHeaders(origin?: string | null): Headers {
  const headers = new Headers();
  
  // Define allowed origins
  const allowedOrigins = [
    'https://kidoova.com',
    'https://www.kidoova.com'
  ];

  // If no origin is provided or origin is not in allowed list, use the first allowed origin
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];

  console.log('🔄 Setting CORS headers:', {
    requestOrigin: origin,
    allowedOrigin,
    isAllowed: allowedOrigins.includes(origin || '')
  });

  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');

  return headers;
}

export const handleOptions = (request: Request) => {
  const origin = request.headers.get('Origin') || '';
  console.log('🔄 CORS preflight request:', {
    origin,
    allowed: ALLOWED_ORIGINS.includes(origin),
    method: request.method,
    url: request.url
  });
  
  const headers = corsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers
  });
}; 