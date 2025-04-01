import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyToken } from '../utils/auth';
import { D1Database } from '@cloudflare/workers-types';

const pillars = new Hono<{ Bindings: { DB: D1Database } }>();

// Get all pillars
pillars.get('/', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      throw new HTTPException(401, { message: 'No token provided' });
    }

    await verifyToken(token);

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM pillars
      ORDER BY id ASC
    `).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching pillars:', error);
    throw new HTTPException(500, { message: 'Failed to fetch pillars' });
  }
});

// Get pillar by ID
pillars.get('/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      throw new HTTPException(401, { message: 'No token provided' });
    }

    await verifyToken(token);

    const pillarId = c.req.param('id');
    const pillar = await c.env.DB.prepare(`
      SELECT * FROM pillars WHERE id = ?
    `).bind(pillarId).first();

    if (!pillar) {
      throw new HTTPException(404, { message: 'Pillar not found' });
    }

    return c.json(pillar);
  } catch (error) {
    console.error('Error fetching pillar:', error);
    throw new HTTPException(500, { message: 'Failed to fetch pillar' });
  }
});

// Get pillar progress
pillars.get('/:id/progress', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      throw new HTTPException(401, { message: 'No token provided' });
    }

    await verifyToken(token);

    const pillarId = c.req.param('id');
    const childId = c.req.query('child_id');

    if (!childId) {
      throw new HTTPException(400, { message: 'Child ID is required' });
    }

    // Get total challenges for this pillar
    const { total } = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM challenges WHERE pillar_id = ?
    `).bind(pillarId).first();

    if (!total) {
      return c.json({ progress: 0 });
    }

    // Get completed challenges for this pillar and child
    const { completed } = await c.env.DB.prepare(`
      SELECT COUNT(*) as completed FROM challenges 
      WHERE pillar_id = ? AND id IN (
        SELECT challenge_id FROM challenge_completions 
        WHERE child_id = ? AND completed_at IS NOT NULL
      )
    `).bind(pillarId, childId).first();

    const progress = (completed / total) * 100;

    return c.json({ progress });
  } catch (error) {
    console.error('Error fetching pillar progress:', error);
    throw new HTTPException(500, { message: 'Failed to fetch pillar progress' });
  }
});

// Get pillar challenges
pillars.get('/:id/challenges', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      throw new HTTPException(401, { message: 'No token provided' });
    }

    await verifyToken(token);

    const pillarId = c.req.param('id');
    const childId = c.req.query('child_id');

    if (!childId) {
      throw new HTTPException(400, { message: 'Child ID is required' });
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        c.*,
        CASE WHEN cc.completed_at IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM challenges c
      LEFT JOIN challenge_completions cc ON c.id = cc.challenge_id AND cc.child_id = ?
      WHERE c.pillar_id = ?
      ORDER BY c.difficulty_level ASC
    `).bind(childId, pillarId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching pillar challenges:', error);
    throw new HTTPException(500, { message: 'Failed to fetch pillar challenges' });
  }
});

export default pillars; 