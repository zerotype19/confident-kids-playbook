import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { JournalEntry } from '../types';

export const JournalPage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    text: '',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/journal/list?child_id=${child_id}`);
        if (!response.ok) throw new Error('Failed to fetch journal entries');
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (child_id) {
      fetchEntries();
    }
  }, [child_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          text: newEntry.text,
        })
      });

      if (!response.ok) throw new Error('Failed to create journal entry');
      
      // Refresh entries list
      const updatedResponse = await fetch(`/api/journal/list?child_id=${child_id}`);
      const updatedData = await updatedResponse.json();
      setEntries(updatedData);
      
      // Clear form
      setNewEntry({ text: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading journal entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedChild?.name}'s Journal
          </h1>
          <p className="mt-2 text-gray-600">
            Record thoughts, reflections, and progress
          </p>
        </div>

        {/* New Entry Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What would you like to record?
            </label>
            <textarea
              value={newEntry.text}
              onChange={(e) => setNewEntry({ text: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
              placeholder="Share your thoughts..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Save Entry
          </button>
        </form>

        {/* Journal Entries */}
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {entry.challenge_id && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Challenge Reflection
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.text}</p>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No journal entries yet. Start by adding your first entry above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 