# 📡 Media Upload API

## POST /api/media/create-upload-url
- Accepts file type, file name, purpose
- Returns signed upload URL + metadata

## POST /api/media/record
- Stores metadata about upload (child_id, type, URL, etc.)

## GET /api/media/list?child_id=...
- Returns all uploaded media for a child

## Usage:
- Used for journal images, child avatars, etc.
