import { getProgressSummary } from "../db/progress";
import { Env } from "../types";
import { corsHeaders } from "../lib/cors";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.searchParams.get('child_id');

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  try {
    const summary = await getProgressSummary(childId);
    return new Response(JSON.stringify(summary), { 
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
} 