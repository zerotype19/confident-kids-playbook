import { Env } from '../types';
import Stripe from 'stripe';

interface PortalRequest {
  child_id: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { child_id } = await request.json() as PortalRequest;
    
    if (!child_id) {
      return new Response(JSON.stringify({ error: 'child_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First, get the family_id from the children table
    const child = await env.DB.prepare(
      `SELECT family_id FROM children WHERE id = ?`
    ).bind(child_id).first();

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the user_id from the users table where selected_child_id matches the child_id
    const user = await env.DB.prepare(
      `SELECT id FROM users WHERE selected_child_id = ?`
    ).bind(child_id).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the subscription to check if it exists and is active
    const subscription = await env.DB.prepare(
      `SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? AND status = 'active'`
    ).bind(user.id).first();

    if (!subscription || !subscription.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.FRONTEND_URL}/manage-profile`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return new Response(JSON.stringify({ error: 'Failed to create billing portal session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 