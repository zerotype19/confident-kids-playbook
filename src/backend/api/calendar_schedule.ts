interface Env {
  DB: D1Database;
}

interface ScheduleRequest {
  child_id: string;
  date: string;
  pillar_id: number;
}

export async function onRequestPost({ request }: { request: Request }) {
  const body = await request.json() as ScheduleRequest;
  const { child_id, date, pillar_id } = body;

  if (!child_id || !date || !pillar_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Validate date is not in the past
  const scheduleDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (scheduleDate < today) {
    return new Response(JSON.stringify({ error: "Cannot schedule for past dates" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // TODO: Replace with D1 query to insert scheduled pillar
  // This is a placeholder response
  return new Response(JSON.stringify({
    success: true,
    message: "Pillar scheduled successfully",
    data: {
      child_id,
      date,
      pillar_id
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
} 