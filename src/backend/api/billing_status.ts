import { Env } from '../types';
import { verifyJWT } from '../auth';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: number;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    // Verify the JWT token and get the user ID
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query the database for subscription status using user_id
    const subscription = await env.DB.prepare(
      `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'`
    ).bind(userId).first() as Subscription | null;

    if (!subscription) {
      return new Response(JSON.stringify({
        isActive: false,
        plan: 'free',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine if the subscription is active based on the status and current_period_end
    const currentPeriodEnd = new Date(subscription.current_period_end);
    const isActive = subscription.status === 'active' && currentPeriodEnd > new Date();

    return new Response(JSON.stringify({
      isActive,
      plan: subscription.plan,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end === 1
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subscription status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 