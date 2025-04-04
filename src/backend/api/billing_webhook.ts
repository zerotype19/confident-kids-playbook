import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    // Get the signature from the headers
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found in headers');
      return new Response('No signature', { status: 400 });
    }

    // Log all headers for debugging
    console.log('All headers:', Object.fromEntries(request.headers.entries()));

    // Get the raw body
    const rawBody = await request.text();
    console.log('Received webhook with signature:', signature);
    console.log('Webhook body:', rawBody);
    console.log('Webhook secret being used:', env.STRIPE_WEBHOOK_SECRET);

    // Initialize Stripe
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Verify the webhook signature using the async version
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Successfully verified webhook signature');
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      console.error('Error details:', {
        signature,
        rawBodyLength: rawBody.length,
        webhookSecretLength: env.STRIPE_WEBHOOK_SECRET.length
      });
      return new Response('Invalid signature', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;
        
        if (!userId) {
          console.error('No user_id found in subscription metadata');
          return new Response('No user_id in metadata', { status: 400 });
        }

        console.log(`Processing subscription ${subscription.id} for user ${userId} with status ${subscription.status}`);

        // Get the product name from the subscription items
        const price = subscription.items.data[0]?.price;
        if (!price) {
          console.error('No price found in subscription items');
          return new Response('No price found', { status: 400 });
        }

        // Fetch the product details to get the name
        const product = await stripe.products.retrieve(price.product as string);
        const plan = product.name;

        // First, check if a subscription record exists
        const existingSubscription = await env.DB.prepare(`
          SELECT id, status FROM subscriptions WHERE user_id = ?
        `).bind(userId).first();

        if (existingSubscription) {
          // Update existing subscription
          const result = await env.DB.prepare(`
            UPDATE subscriptions 
            SET status = ?, 
                stripe_subscription_id = ?,
                stripe_customer_id = ?,
                plan = ?,
                current_period_end = ?,
                cancel_at_period_end = ?,
                updated_at = datetime('now')
            WHERE user_id = ?
          `).bind(
            subscription.status,
            subscription.id,
            subscription.customer,
            plan,
            new Date(subscription.current_period_end * 1000).toISOString(),
            subscription.cancel_at_period_end ? 1 : 0,
            userId
          ).run();

          if (result.success) {
            console.log(`Updated subscription status for user ${userId} from ${existingSubscription.status} to ${subscription.status}`);
          } else {
            console.error(`Failed to update subscription for user ${userId}`);
            return new Response('Failed to update subscription', { status: 500 });
          }
        } else {
          // Insert new subscription
          const result = await env.DB.prepare(`
            INSERT INTO subscriptions (
              user_id,
              status,
              stripe_subscription_id,
              stripe_customer_id,
              plan,
              current_period_end,
              cancel_at_period_end,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).bind(
            userId,
            subscription.status,
            subscription.id,
            subscription.customer,
            plan,
            new Date(subscription.current_period_end * 1000).toISOString(),
            subscription.cancel_at_period_end ? 1 : 0
          ).run();

          if (result.success) {
            console.log(`Created new subscription for user ${userId} with status ${subscription.status}`);
          } else {
            console.error(`Failed to create subscription for user ${userId}`);
            return new Response('Failed to create subscription', { status: 500 });
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;
        
        if (!userId) {
          console.error('No user_id found in subscription metadata');
          return new Response('No user_id in metadata', { status: 400 });
        }

        console.log(`Processing subscription deletion for user ${userId}`);

        // Update the subscription status to canceled
        try {
          const result = await env.DB.prepare(`
            UPDATE subscriptions 
            SET status = 'canceled',
                stripe_subscription_id = NULL,
                stripe_customer_id = NULL,
                plan = 'free',
                current_period_end = NULL,
                cancel_at_period_end = 0,
                updated_at = datetime('now')
            WHERE user_id = ?
          `).bind(userId).run();

          if (result.success) {
            console.log(`Successfully canceled subscription for user ${userId}`);
          } else {
            console.error(`Failed to cancel subscription for user ${userId}: No rows affected`);
          }
        } catch (err) {
          console.error('Failed to update subscription status:', err);
          return new Response('Database update failed', { status: 500 });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}; 