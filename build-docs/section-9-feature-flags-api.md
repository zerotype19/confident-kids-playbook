# 📡 Feature Flags API

## GET /api/flags
Returns a list of resolved feature flags for the current user.

Response example:
```json
{
  "is_premium": true,
  "practice_enabled": true,
  "media_uploads": true
}
```
