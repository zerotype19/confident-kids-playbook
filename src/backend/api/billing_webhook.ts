import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    console.log('🔔 Webhook received - Headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔔 Webhook received - URL:', request.url);
    console.log('🔔 Webhook received - Method:', request.method);
    console.log('🔔 Webhook received - Request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });
    
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.text();
    console.log('🎯 Received webhook event body:', body);
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      console.log('🔑 Verifying webhook signature with secret:', env.STRIPE_WEBHOOK_SECRET);
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Successfully verified webhook signature for event:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      console.error('❌ Webhook signature:', signature);
      console.error('❌ Webhook body:', body);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🎯 Processing event type:', event.type);
    console.log('🎯 Full event data:', JSON.stringify(event, null, 2));

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.user_id;
        
        console.log('📝 Subscription details:', {
          customerId,
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          eventType: event.type,
          metadata: subscription.metadata
        });
        
        if (!userId) {
          console.error('❌ No user_id in subscription metadata');
          return new Response(JSON.stringify({ error: 'No user_id in subscription metadata' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        try {
          // Update or insert the subscription in the database
          const sql = `
            INSERT INTO subscriptions (
              id, user_id, stripe_customer_id, stripe_subscription_id, 
              plan, status, current_period_end, cancel_at_period_end
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              stripe_customer_id = excluded.stripe_customer_id,
              stripe_subscription_id = excluded.stripe_subscription_id,
              plan = excluded.plan,
              status = excluded.status,
              current_period_end = excluded.current_period_end,
              cancel_at_period_end = excluded.cancel_at_period_end
          `;

          const result = await env.DB.prepare(sql)
            .bind(
              crypto.randomUUID(),
              userId,
              customerId,
              subscription.id,
              'Kidoova Simple', // Default plan name
              subscription.status,
              new Date(subscription.current_period_end * 1000).toISOString(),
              subscription.cancel_at_period_end ? 1 : 0
            )
            .run();

          console.log('💾 Database update result:', result);
          
          return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;
        
        if (!userId) {
          console.error('❌ No user_id in subscription metadata');
          return new Response(JSON.stringify({ error: 'No user_id in subscription metadata' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        try {
          const result = await env.DB.prepare(
            `UPDATE subscriptions SET status = 'canceled' WHERE user_id = ?`
          ).bind(userId).run();

          console.log('💾 Subscription cancellation result:', result);
          
          return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
        return new Response(JSON.stringify({ received: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack);
    }
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 