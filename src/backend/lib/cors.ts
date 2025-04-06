import { Env } from '../types';

// Define allowed origins at module scope
const allowedOrigins = [
  'https://kidoova.com',
  'https://www.kidoova.com'
];

export function corsHeaders(origin?: string | null): Headers {
  const headers = new Headers();
  
  // Ensure origin is a string and not an object
  const requestOrigin = typeof origin === 'string' ? origin : '';
  
  // If no origin is provided or origin is not in allowed list, use the first allowed origin
  const allowedOrigin = requestOrigin && allowedOrigins.includes(requestOrigin) 
    ? requestOrigin 
    : allowedOrigins[0];

  console.log('🔄 Setting CORS headers:', {
    requestOrigin,
    allowedOrigin,
    isAllowed: allowedOrigins.includes(requestOrigin)
  });

  // Set the CORS headers
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
    allowed: allowedOrigins.includes(origin),
    method: request.method,
    url: request.url
  });
  
  // Only set CORS headers once
  const headers = corsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers
  });
}; 