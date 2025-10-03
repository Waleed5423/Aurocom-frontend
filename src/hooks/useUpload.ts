// src/hooks/useUpload.ts - SIMPLEST WORKING VERSION
import { useState } from 'react';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMultipleFiles = async (files: File[]): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const uploadPromises = files.map(file => uploadSingleFile(file));
      const results = await Promise.all(uploadPromises);

      clearInterval(progressInterval);
      setProgress(100);

      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} files failed to upload`;
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }

      return {
        success: true,
        data: successfulUploads.map(result => result.data)
      };
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadMultipleFiles,
    isUploading,
    progress,
    error,
    clearError
  };
};

// Helper function for single file upload
async function uploadSingleFile(file: File): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Upload failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Upload failed'
    };
  }
}

export const useProductImageUpload = () => {
  const upload = useUpload();

  const uploadProductImages = (files: File[]) => {
    return upload.uploadMultipleFiles(files);
  };

  return {
    ...upload,
    uploadProductImages
  };
};