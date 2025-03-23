interface Env {
  DB: D1Database;
}

interface CalendarDay {
  completed_challenge_id?: string;
  scheduled_pillar_id?: number;
}

interface CalendarData {
  child_id: string;
  days: {
    [key: string]: CalendarDay;
  };
}

export async function onRequestGet({ params, env, request }: { params: any; env: Env; request: Request }) {
  const url = new URL(request.url);
  const childId = url.searchParams.get("child_id");
  const month = url.searchParams.get("month");

  if (!childId || !month) {
    return new Response(JSON.stringify({ error: "Missing child_id or month" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // TODO: Replace with D1 queries to get:
  // 1. Completed challenges for the month
  // 2. Scheduled pillars for the month
  // This is a placeholder response
  return new Response(JSON.stringify({
    child_id: childId,
    days: {
      "2024-03-01": { completed_challenge_id: "chal42" },
      "2024-03-02": { scheduled_pillar_id: 1 },
      "2024-03-03": { completed_challenge_id: "chal43" },
      "2024-03-04": { scheduled_pillar_id: 2 }
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
} 