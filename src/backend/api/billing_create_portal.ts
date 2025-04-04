import { Env } from '../types';
import Stripe from 'stripe';
import { verifyJWT, JwtPayload } from '../auth';

interface SubscriptionRecord {
  stripe_customer_id: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    // Verify the JWT token and get the user ID
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token, env);
    const userId = payload.sub;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the subscription to check if it exists and is active
    const subscription = await env.DB.prepare(
      `SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? AND status = 'active'`
    ).bind(userId).first() as SubscriptionRecord | null;

    console.log('Subscription record:', subscription);

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
      return_url: `${env.FRONTEND_URL}/manage-profile`
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