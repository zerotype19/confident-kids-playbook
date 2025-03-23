import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface JournalEntry {
  id: string;
  child_id: string;
  entry_text: string;
  mood_rating: number;
  tags: string[];
  created_at: string;
}

export const JournalPage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const flags = useFeatureFlags();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    entry_text: '',
    mood_rating: 3,
    tags: ''
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
          entry_text: newEntry.entry_text,
          mood_rating: newEntry.mood_rating,
          tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (!response.ok) throw new Error('Failed to create journal entry');
      
      // Refresh entries list
      const updatedResponse = await fetch(`/api/journal/list?child_id=${child_id}`);
      const updatedData = await updatedResponse.json();
      setEntries(updatedData);
      
      // Clear form
      setNewEntry({
        entry_text: '',
        mood_rating: 3,
        tags: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">
        {selectedChild?.name}'s Journal
      </h1>

      {/* New Entry Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What happened today?
          </label>
          <textarea
            value={newEntry.entry_text}
            onChange={(e) => setNewEntry(prev => ({ ...prev, entry_text: e.target.value }))}
            className="w-full p-2 border rounded-md"
            rows={4}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mood Rating
          </label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setNewEntry(prev => ({ ...prev, mood_rating: rating }))}
                className={`w-10 h-10 rounded-full ${
                  newEntry.mood_rating === rating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {['😢', '😕', '😐', '🙂', '😊'][rating - 1]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={newEntry.tags}
            onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-2 border rounded-md"
            placeholder="confidence, resilience, etc."
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Entry
        </button>
      </form>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No journal entries yet</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {['😢', '😕', '😐', '🙂', '😊'][entry.mood_rating - 1]}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-800 mb-3">{entry.entry_text}</p>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Premium Features */}
      {flags.includes('premium.journal_export') && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Premium Features</h2>
          <button className="text-blue-500 hover:text-blue-600">
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
}; 