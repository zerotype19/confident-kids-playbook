import { Env } from '../types';

const ALLOWED_ORIGINS = [
  'https://kidoova.com',
  'https://www.kidoova.com'
];

export const corsHeaders = (origin?: string) => {
  console.log('🔄 corsHeaders called with origin:', origin);
  
  // If no origin is provided or it's not in the allowed list, use the first allowed origin
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  console.log('🔄 Setting CORS headers:', {
    requestOrigin: origin,
    allowedOrigin,
    isAllowed: ALLOWED_ORIGINS.includes(origin || '')
  });
  
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  
  return headers;
};

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