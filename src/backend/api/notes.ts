import { Env } from '../types';

interface Note {
  id: string;
  child_id: string;
  content: string;
  created_at: string;
}

export async function notes({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.searchParams.get('child_id');

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // TODO: Replace with actual database query
    // For now, return mock notes
    const notes: Note[] = [
      {
        id: '1',
        child_id: childId,
        content: 'Great progress on today\'s challenge!',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        child_id: childId,
        content: 'Showed excellent problem-solving skills.',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ];

    return new Response(JSON.stringify(notes), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch notes' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function createNote({ request, env }: { request: Request; env: Env }) {
  try {
    const { child_id, content } = await request.json();

    if (!child_id || !content) {
      return new Response(
        JSON.stringify({ error: 'Child ID and content are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Replace with actual database insert
    // For now, return a mock note
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      child_id,
      content,
      created_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create note' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 