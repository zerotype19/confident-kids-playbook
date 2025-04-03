import { Env } from '../types';

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
    // First, get the user_id from the children table
    const child = await env.DB.prepare(
      `SELECT user_id FROM children WHERE id = ?`
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

    // Query the database for subscription status using user_id
    const subscription = await env.DB.prepare(
      `SELECT * FROM subscriptions WHERE user_id = ?`
    ).bind(child.user_id).first();

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

    // Determine if the subscription is active based on the plan
    const isActive = subscription.plan === 'premium';

    return new Response(JSON.stringify({
      isActive,
      plan: subscription.plan,
      currentPeriodEnd: null, // Not available in the current schema
      cancelAtPeriodEnd: false // Not available in the current schema
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