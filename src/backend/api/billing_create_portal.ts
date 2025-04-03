import { Env, PortalRequest } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { child_id } = await request.json() as PortalRequest;

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
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the customer ID from the database
    const subscription = await env.DB.prepare(
      `SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?`
    ).bind(child.user_id).first();

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.FRONTEND_URL}/settings/billing`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response(JSON.stringify({ error: 'Failed to create portal session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 