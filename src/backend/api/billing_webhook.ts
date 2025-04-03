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
      apiVersion: '2023-10-16',
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
        const user_id = session.metadata?.user_id;
        const customer_id = session.customer as string;
        const subscription_id = session.subscription as string;

        if (!user_id) {
          throw new Error('No user_id in session metadata');
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscription_id);
        
        // Create or update subscription record
        const existingSubscription = await env.DB.prepare(
          `SELECT id FROM subscriptions WHERE user_id = ?`
        ).bind(user_id).first();

        if (existingSubscription) {
          // Update existing subscription
          await env.DB.prepare(`
            UPDATE subscriptions 
            SET stripe_customer_id = ?,
                stripe_subscription_id = ?,
                plan = ?,
                status = ?,
                current_period_end = ?,
                cancel_at_period_end = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).bind(
            customer_id,
            subscription_id,
            'premium',
            subscription.status,
            new Date(subscription.current_period_end * 1000).toISOString(),
            subscription.cancel_at_period_end ? 1 : 0,
            user_id
          ).run();
        } else {
          // Create new subscription
          await env.DB.prepare(`
            INSERT INTO subscriptions (
              id,
              user_id,
              stripe_customer_id,
              stripe_subscription_id,
              plan,
              status,
              current_period_end,
              cancel_at_period_end,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `).bind(
            `sub_${Date.now()}`,
            user_id,
            customer_id,
            subscription_id,
            'premium',
            subscription.status,
            new Date(subscription.current_period_end * 1000).toISOString(),
            subscription.cancel_at_period_end ? 1 : 0
          ).run();
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer_id = subscription.customer as string;
        const subscription_id = subscription.id;

        // Get user_id from our database
        const record = await env.DB.prepare(
          'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
        ).bind(customer_id).first();

        if (!record) {
          throw new Error('No subscription record found for customer');
        }

        // Update subscription status
        await env.DB.prepare(`
          UPDATE subscriptions 
          SET plan = ?,
              status = ?,
              current_period_end = ?,
              cancel_at_period_end = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE stripe_customer_id = ?
        `).bind(
          subscription.status === 'active' ? 'premium' : 'free',
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