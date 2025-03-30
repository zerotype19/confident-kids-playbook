import { Env } from "../../types";
import { getChildRewards } from "../../lib/rewardEngine";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.pathname.split('/').pop();

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rewards = await getChildRewards(childId, env);
    return new Response(JSON.stringify(rewards), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch rewards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 