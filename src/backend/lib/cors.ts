import { Env } from '../types';

const ALLOWED_ORIGINS = [
  'https://kidoova.com',
  'https://www.kidoova.com'
];

export const corsHeaders = (origin?: string) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  });
};

export const handleOptions = (request: Request) => {
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers
  });
}; 