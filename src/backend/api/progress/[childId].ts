import { getProgressSummary } from "../../../db/progress";

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { params: { childId: string }, env: Env }) {
  const childId = context.params.childId;
  const summary = await getProgressSummary(childId);
  return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
} 