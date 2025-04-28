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
import { onRequestPost as acceptInviteHandler } from './accept-invite';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
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

// Family invite routes
app.post('/api/accept-invite', acceptInviteHandler);

export default app; 