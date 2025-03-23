import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MediaUploadProps {
  childId: string;
  onUploadComplete: (media: any) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  childId,
  onUploadComplete,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
}) => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Step 1: Get signed URL
      const urlResponse = await fetch('/api/media/create-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileType: file.type }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key, filename } = await urlResponse.json();

      // Step 2: Upload file
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Step 3: Record media
      const recordResponse = await fetch('/api/media/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: childId,
          key,
          filename,
          file_type: file.type,
          size: file.size,
        }),
      });

      if (!recordResponse.ok) {
        throw new Error('Failed to record media');
      }

      const media = await recordResponse.json();
      onUploadComplete(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`
          px-4 py-2 rounded-lg
          ${isUploading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
          }
          text-white font-medium
          transition-colors duration-200
        `}
      >
        {isUploading ? 'Uploading...' : 'Upload Media'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 