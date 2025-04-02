import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { D1Database } from '@cloudflare/workers-types';

import auth from './auth';
import children from './children';
import challenges from './challenges';
import pillars from './pillars';
import rewards from './rewards/[childId]';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Routes
app.route('/api/auth', auth);
app.route('/api/children', children);
app.route('/api/challenges', challenges);
app.route('/api/pillars', pillars);
app.route('/api/rewards/:childId', rewards);

export default app; 