import { Env } from '../types';
import Stripe from 'stripe';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Get the prices from Stripe, only active products
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    });

    // Filter prices for our specific products
    const filteredPrices = prices.data.filter(price => {
      const product = price.product as Stripe.Product;
      return product.id === 'prod_Rz40ev2BvHHJPI' || product.id === 'prod_S3uZxpqZtkYe6V';
    });

    // Format the prices for the frontend
    const plans = filteredPrices.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: product.metadata.plan_type || 'single',
        name: product.name,
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        features: JSON.parse(product.metadata.features || '[]'),
        interval: price.recurring?.interval || 'month',
        price_id: price.id
      };
    });

    return new Response(JSON.stringify({ plans }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subscription plans' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 