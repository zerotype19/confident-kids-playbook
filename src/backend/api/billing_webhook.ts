import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.text();
    console.log('🎯 Received webhook event:', body);
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Successfully verified webhook signature');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🎯 Processing event type:', event.type);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.user_id;
        
        // Get the product details from the subscription items
        const subscriptionItem = subscription.items.data[0];
        const price = subscriptionItem.price;
        const productId = price.product as string;
        
        // Fetch the product details to get the name
        let productName = 'Unknown Plan';
        try {
          const product = await stripe.products.retrieve(productId);
          productName = product.name;
          console.log('📦 Retrieved product:', product);
        } catch (productError) {
          console.error('❌ Error fetching product:', productError);
        }
        
        console.log('📝 Subscription data:', {
          customerId,
          userId,
          subscriptionId: subscription.id,
          plan: productName,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          eventType: event.type,
          productId,
          paymentStatus: subscription.latest_invoice ? await stripe.invoices.retrieve(subscription.latest_invoice as string).then(inv => inv.status) : 'unknown'
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
              status = CASE 
                WHEN excluded.cancel_at_period_end = 1 THEN 'canceled'
                ELSE excluded.status
              END,
              current_period_end = excluded.current_period_end,
              cancel_at_period_end = excluded.cancel_at_period_end,
              updated_at = CURRENT_TIMESTAMP
          `;
          
          const params = {
            id: crypto.randomUUID(),
            userId,
            customerId,
            subscriptionId: subscription.id,
            plan: productName,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0
          };

          console.log('🔍 Executing SQL:', sql);
          console.log('🔍 With parameters:', params);

          const result = await env.DB.prepare(sql).bind(
            params.id,
            params.userId,
            params.customerId,
            params.subscriptionId,
            params.plan,
            params.status,
            params.currentPeriodEnd,
            params.cancelAtPeriodEnd
          ).run();
          
          console.log('✅ Database update result:', result);
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          throw dbError;
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;
        
        console.log('🗑️ Deleting subscription for user:', userId);
        
        if (!userId) {
          console.error('❌ No user_id in subscription metadata');
          return new Response(JSON.stringify({ error: 'No user_id in subscription metadata' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        try {
          const sql = `
            UPDATE subscriptions 
            SET status = 'canceled', 
                cancel_at_period_end = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `;
          
          console.log('🔍 Executing SQL:', sql);
          console.log('🔍 With parameters:', { userId });

          const result = await env.DB.prepare(sql).bind(userId).run();
          
          console.log('✅ Subscription deletion result:', result);
        } catch (dbError) {
          console.error('❌ Database error during deletion:', dbError);
          throw dbError;
        }
        
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        console.log('💰 Invoice paid for subscription:', subscriptionId);
        
        try {
          // Update the subscription status to active
          const sql = `
            UPDATE subscriptions 
            SET status = 'active',
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `;
          
          console.log('🔍 Executing SQL:', sql);
          console.log('🔍 With parameters:', { subscriptionId });

          const result = await env.DB.prepare(sql).bind(subscriptionId).run();
          
          console.log('✅ Subscription status update result:', result);
        } catch (dbError) {
          console.error('❌ Database error during status update:', dbError);
          throw dbError;
        }
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 