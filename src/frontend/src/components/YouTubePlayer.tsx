import React from 'react';

interface YouTubePlayerProps {
  videoId: string;
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
} 