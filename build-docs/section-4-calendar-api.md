# 📡 Section 4 API: Calendar

## POST /api/calendar/schedule

Body:
- child_id
- date (YYYY-MM-DD)
- focus_pillar_id (optional)
- note (optional)

## GET /api/calendar/history?child_id=...

Returns:
- List of completed challenges with timestamp
- List of future scheduled intentions
