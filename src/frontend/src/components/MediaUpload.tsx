import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  purpose: 'avatar' | 'journal';
  maxSize?: number; // in bytes
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  purpose,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      // Step 1: Get signed URL
      const createUrlResponse = await fetch('/api/media/create-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileType: file.type,
          purpose: purpose,
        }),
      });

      if (!createUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key, filename } = await createUrlResponse.json();

      // Step 2: Upload file
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Step 3: Record metadata
      const recordResponse = await fetch('/api/media/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key,
          filename,
          type: file.type,
          size: file.size,
          purpose: purpose,
        }),
      });

      if (!recordResponse.ok) {
        throw new Error('Failed to record upload');
      }

      const { url } = await recordResponse.json();
      onUploadComplete(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`
          w-full px-4 py-2 rounded-lg border-2 border-dashed
          ${isUploading 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-blue-500 hover:border-blue-600 hover:bg-blue-50'
          }
          transition-colors duration-200
        `}
      >
        {isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Uploading... {Math.round(progress)}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-gray-600">Click to upload image</span>
            <span className="text-xs text-gray-400">JPEG, PNG, or GIF (max {maxSize / (1024 * 1024)}MB)</span>
          </div>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}; 