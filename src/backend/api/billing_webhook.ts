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

        // Update the subscription status in the database
        try {
          await env.DB.prepare(`
            UPDATE subscriptions 
            SET status = ?, 
                stripe_subscription_id = ?,
                updated_at = datetime('now')
            WHERE user_id = ?
          `).bind(
            subscription.status,
            subscription.id,
            userId
          ).run();

          console.log(`Updated subscription status for user ${userId} to ${subscription.status}`);
        } catch (err) {
          console.error('Failed to update subscription status:', err);
          return new Response('Database update failed', { status: 500 });
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

        // Update the subscription status to canceled
        try {
          await env.DB.prepare(`
            UPDATE subscriptions 
            SET status = 'canceled',
                stripe_subscription_id = NULL,
                updated_at = datetime('now')
            WHERE user_id = ?
          `).bind(userId).run();

          console.log(`Canceled subscription for user ${userId}`);
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