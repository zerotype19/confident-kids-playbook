import { useEffect, useState } from "react";

interface ProgressData {
  totalCompleted: number;
  currentStreak: number;
  currentFocusPillar: string;
}

interface ChildProgressTrackerProps {
  childId: string;
}

const pillarNames: Record<number, string> = {
  1: "Independence & Problem-Solving",
  2: "Growth Mindset & Resilience",
  3: "Social Confidence & Communication",
  4: "Purpose & Strength Discovery",
  5: "Managing Fear & Anxiety"
};

export default function ChildProgressTracker({ childId }: ChildProgressTrackerProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const url = `${import.meta.env.VITE_API_URL}/api/progress?child_id=${childId}`;
        console.log('Fetching progress from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Progress API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Progress API error response:', errorText);
          throw new Error(`Failed to fetch progress: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Progress API response data:', data);
        setData(data);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError(err instanceof Error ? err.message : "Failed to load progress data");
      }
    };

    if (childId) {
      console.log('ChildProgressTracker: childId changed, fetching progress for:', childId);
      fetchProgress();
    }
  }, [childId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h2>
      <div className="space-y-3">
        <p className="flex items-center">
          <span className="text-green-500 mr-2">✅</span>
          <strong>Challenges Completed:</strong> {data.totalCompleted}
        </p>
        <p className="flex items-center">
          <span className="text-orange-500 mr-2">🔥</span>
          <strong>Current Streak:</strong> {data.currentStreak} day{data.currentStreak !== 1 ? 's' : ''}
        </p>
        <p className="flex items-center">
          <span className="text-blue-500 mr-2">🌟</span>
          <strong>Current Focus:</strong> {data.currentFocusPillar}
        </p>
      </div>
    </div>
  );
} 