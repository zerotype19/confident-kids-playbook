import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const child_id = session.metadata?.child_id;
        const customer_id = session.customer as string;

        if (!child_id) {
          throw new Error('No child_id in session metadata');
        }

        // Create subscription record
        await env.DB.prepare(`
          INSERT INTO subscriptions (
            child_id,
            stripe_customer_id,
            stripe_subscription_id,
            plan_id,
            status,
            current_period_end,
            cancel_at_period_end,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          child_id,
          customer_id,
          session.subscription as string,
          session.metadata?.plan_id || 'premium',
          'active',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          0
        ).run();

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer_id = subscription.customer as string;

        // Get child_id from our database
        const record = await env.DB.prepare(
          'SELECT child_id FROM subscriptions WHERE stripe_customer_id = ?'
        ).bind(customer_id).first();

        if (!record) {
          throw new Error('No subscription record found for customer');
        }

        // Update subscription status
        await env.DB.prepare(`
          UPDATE subscriptions 
          SET status = ?,
              current_period_end = ?,
              cancel_at_period_end = ?,
              updated_at = datetime('now')
          WHERE stripe_customer_id = ?
        `).bind(
          subscription.status,
          new Date(subscription.current_period_end * 1000).toISOString(),
          subscription.cancel_at_period_end ? 1 : 0,
          customer_id
        ).run();

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 