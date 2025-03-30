import { getProgressSummary } from "../db/progress";
import { Env } from "../types";
import { corsHeaders } from "../lib/cors";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  console.log('Progress API: Request received', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  });

  const url = new URL(request.url);
  const childId = url.searchParams.get('child_id');

  console.log('Progress API: Parsed URL parameters', {
    childId,
    searchParams: Object.fromEntries(url.searchParams.entries())
  });

  if (!childId) {
    console.log('Progress API: Missing child_id parameter');
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Progress API: Fetching progress summary for child:', childId);
    const summary = await getProgressSummary(childId, env);
    console.log('Progress API: Successfully fetched summary:', summary);
    
    return new Response(JSON.stringify(summary), { 
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Progress API: Error fetching progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
} 