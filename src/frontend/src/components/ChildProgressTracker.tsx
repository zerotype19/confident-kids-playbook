import { useEffect, useState } from "react";
import axios from "axios";

interface ProgressData {
  totalCompleted: number;
  streak: number;
  focusPillarId: number | null;
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

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/progress/${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (err) {
        setError("Failed to load progress data");
        console.error("Error fetching progress:", err);
      }
    };

    if (childId) {
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
          <strong>Current Streak:</strong> {data.streak} day{data.streak !== 1 ? 's' : ''}
        </p>
        <p className="flex items-center">
          <span className="text-blue-500 mr-2">🌟</span>
          <strong>Current Focus:</strong> {data.focusPillarId ? pillarNames[data.focusPillarId] : "No data yet"}
        </p>
      </div>
    </div>
  );
} 