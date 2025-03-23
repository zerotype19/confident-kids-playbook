# 📡 Authentication API

## POST /api/auth/login
- Handles OAuth token exchange
- Returns session token (JWT)

## GET /api/family
- Returns the current user's family context, children, and members

## POST /api/family/invite
- Send invite link/code to another guardian

## POST /api/family/join
- Join family using invite

## POST /api/auth/logout
- Invalidate session (optional)

