import React, { useEffect, useState } from 'react';

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NotesSectionProps {
  childId: string;
}

export default function NotesSection({ childId }: NotesSectionProps): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/notes?child_id=${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [childId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          child_id: childId,
          content: newNote
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const data = await response.json();
      setNotes(prev => [data, ...prev]);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notes</h2>

      <form onSubmit={handleAddNote} className="space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-24"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Add Note
        </button>
      </form>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">{note.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 