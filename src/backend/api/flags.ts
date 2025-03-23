import { Env, FeatureFlags } from '../types';
import jwt from 'jsonwebtoken';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { user_id: string };

    // Get user's subscription status
    const { results: [subscription] } = await env.DB.prepare(
      'SELECT status FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(decoded.user_id).all();

    const isPremium = subscription?.status === 'active';

    // Define feature flags based on subscription status
    const flags: FeatureFlags = {
      is_premium: isPremium,
      practice_enabled: isPremium,
      media_uploads: isPremium,
      calendar_enabled: isPremium,
      journal_enabled: true, // Basic feature available to all
      family_sharing: isPremium,
    };

    return new Response(JSON.stringify(flags), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get feature flags' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 