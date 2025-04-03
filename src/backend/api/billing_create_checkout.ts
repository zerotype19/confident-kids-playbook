import { Env, CheckoutRequest } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { child_id } = await request.json() as CheckoutRequest;

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

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/manage-profile?success=true`,
      cancel_url: `${env.FRONTEND_URL}/manage-profile?canceled=true`,
      client_reference_id: child_id,
      metadata: {
        user_id: child.user_id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 