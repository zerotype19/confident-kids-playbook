import { Env } from '../types';

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
  const url = new URL(request.url);
  const child_id = url.searchParams.get('child_id');

  if (!child_id) {
    return new Response(JSON.stringify({ error: 'child_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // First, get the family_id from the children table
    const child = await env.DB.prepare(
      `SELECT family_id FROM children WHERE id = ?`
    ).bind(child_id).first();

    if (!child) {
      return new Response(JSON.stringify({
        isActive: false,
        plan: 'free',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First try to get the user by selected_child_id
    let user = await env.DB.prepare(
      `SELECT id FROM users WHERE selected_child_id = ?`
    ).bind(child_id).first();

    // If not found, try to get the user by family_id
    if (!user) {
      user = await env.DB.prepare(
        `SELECT id FROM users WHERE family_id = ?`
      ).bind(child.family_id).first();
    }

    if (!user) {
      return new Response(JSON.stringify({
        isActive: false,
        plan: 'free',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query the database for subscription status using user_id
    const subscription = await env.DB.prepare(
      `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'`
    ).bind(user.id).first() as Subscription | null;

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