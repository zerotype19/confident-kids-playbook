import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { Env } from '../types';
import { verifyJWT } from '../auth';
import { onRequest as childrenHandler } from './children';
import { onRequestGet as challengesTodayHandler } from './challenges_today';
import pillars from './pillars';
import { onRequestGet as rewardsHandler } from './rewards/[childId]';
import { onRequest as childrenUpdate } from './children_update';
import { onRequestPost as familyJoinHandler } from './family_join';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: 'https://kidoova.com',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  credentials: true,
  maxAge: 86400,
}));
app.use('*', prettyJSON());

// Children routes
app.all('/api/children', childrenHandler);
app.all('/api/children/:id', childrenUpdate);

// Challenges routes
app.get('/api/challenges/today', challengesTodayHandler);

// Pillars routes
app.route('/api/pillars', pillars);

// Rewards routes
app.get('/api/rewards/:childId', rewardsHandler);

// Family routes
app.post('/api/family_join', familyJoinHandler);

export default app; 