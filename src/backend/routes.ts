import { Router } from 'itty-router';
import { onRequestGet as getChallenge, onRequestPost as completeChallenge } from './api/challenges';
import { onRequestPost as chatbot, onRequestOptions as chatbotOptions } from './api/chatbot';
import { onRequestPost as reflection } from './api/reflection';

const router = Router();

// Chatbot routes
router.post('/api/chatbot', chatbot);
router.options('/api/chatbot', chatbotOptions);

// Challenge routes
router.get('/api/challenges/:id', getChallenge);
router.post('/api/challenges/:id/complete', completeChallenge);

// Reflection routes
router.post('/api/reflection', reflection);

// Handle other OPTIONS requests
router.options('*', (request: Request) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://kidoova.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    }
  });
});

export default router; 