import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Map the prices to our subscription plan format
    const plans = prices.data.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: product.metadata.plan_type || 'single', // Default to 'single' if not specified
        name: product.name,
        price: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents to dollars
        features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
        interval: price.recurring?.interval || 'month',
        price_id: price.id,
      };
    });

    return new Response(JSON.stringify({ plans }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch prices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 