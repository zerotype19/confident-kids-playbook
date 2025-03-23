import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { PILLAR_NAMES, PillarId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../components/FeatureGate';

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

export const CalendarPage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const flags = useFeatureFlags();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulingDate, setSchedulingDate] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
        const response = await fetch(`/api/calendar/view?child_id=${child_id}&month=${monthStr}`);
        if (!response.ok) throw new Error('Failed to fetch calendar data');
        const data = await response.json();
        setCalendarData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (child_id) {
      fetchCalendarData();
    }
  }, [child_id, currentMonth]);

  const handleSchedulePillar = async () => {
    if (!schedulingDate || !selectedPillar) return;

    try {
      const response = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          date: schedulingDate,
          pillar_id: selectedPillar
        })
      });

      if (!response.ok) throw new Error('Failed to schedule pillar');

      // Refresh calendar data
      const monthStr = currentMonth.toISOString().slice(0, 7);
      const calendarResponse = await fetch(`/api/calendar/view?child_id=${child_id}&month=${monthStr}`);
      if (!calendarResponse.ok) throw new Error('Failed to refresh calendar data');
      const data = await calendarResponse.json();
      setCalendarData(data);

      // Reset scheduling state
      setSchedulingDate(null);
      setSelectedPillar(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule pillar');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading calendar...</div>
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

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <FeatureGate feature="calendar_enabled">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Calendar</h1>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedChild?.name}'s Calendar
              </h1>
              <p className="mt-2 text-gray-600">
                Track completed challenges and plan future activities
              </p>
            </div>

            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="text-indigo-600 hover:text-indigo-700"
              >
                ← Previous Month
              </button>
              <h2 className="text-xl font-semibold">{monthName}</h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Next Month →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateStr = formatDate(date);
                  const dayData = calendarData?.days[dateStr];
                  const isPast = isDateInPast(date);

                  return (
                    <div
                      key={dateStr}
                      className={`
                        aspect-square border rounded-lg p-2
                        ${isPast ? 'bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}
                        ${schedulingDate === dateStr ? 'ring-2 ring-indigo-500' : ''}
                      `}
                      onClick={() => {
                        if (!isPast && flags['premium.calendar_scheduling']) {
                          setSchedulingDate(dateStr);
                        }
                      }}
                    >
                      <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                      <div className="text-xs space-y-1">
                        {dayData?.completed_challenge_id && (
                          <div className="text-green-600">✅</div>
                        )}
                        {dayData?.scheduled_pillar_id && (
                          <div className="text-indigo-600">🔮</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduling Modal */}
            {schedulingDate && flags['premium.calendar_scheduling'] && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Schedule Pillar for {new Date(schedulingDate).toLocaleDateString()}
                  </h3>
                  <select
                    value={selectedPillar || ''}
                    onChange={(e) => setSelectedPillar(Number(e.target.value))}
                    className="w-full p-2 border rounded-md mb-4"
                  >
                    <option value="">Select a pillar...</option>
                    {Object.entries(PILLAR_NAMES).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name as string}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSchedulingDate(null);
                        setSelectedPillar(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSchedulePillar}
                      disabled={!selectedPillar}
                      className={`
                        px-4 py-2 rounded-md
                        ${selectedPillar
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}; 