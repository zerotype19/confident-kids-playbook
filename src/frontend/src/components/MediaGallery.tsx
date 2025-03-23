import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MediaItem {
  id: string;
  key: string;
  filename: string;
  file_type: string;
  created_at: string;
}

interface MediaGalleryProps {
  childId: string;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  childId,
  className = '',
}) => {
  const { token } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`/api/media/list?child_id=${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }

        const data = await response.json();
        setMedia(data.media);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [childId, token]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        No media uploaded yet
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {media.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
        >
          <img
            src={`/api/media/${item.key}`}
            alt={item.filename}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}; 