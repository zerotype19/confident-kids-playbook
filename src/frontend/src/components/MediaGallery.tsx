import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MediaItem } from '../../backend/types';
import { FeatureGate } from './FeatureGate';

interface MediaGalleryProps {
  childId: string;
  purpose?: 'avatar' | 'journal';
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  childId,
  purpose,
  className = '',
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = new URL('/api/media/list', window.location.origin);
        url.searchParams.append('child_id', childId);
        if (purpose) {
          url.searchParams.append('purpose', purpose);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }

        const data = await response.json();
        setMedia(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [childId, purpose, token]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`p-4 text-gray-500 text-center ${className}`}>
        No media found
      </div>
    );
  }

  return (
    <FeatureGate feature="media_uploads">
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
        {media.map((item) => (
          <div key={item.id} className="relative group">
            <img
              src={item.url}
              alt={item.filename}
              className="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FeatureGate>
  );
}; 