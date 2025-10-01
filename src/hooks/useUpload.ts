import { useState } from 'react';
import { uploadService, UploadResponse } from '@/lib/upload';

interface UseUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, endpoint?: string, uploadOptions?: any): Promise<UploadResponse> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress (in real implementation, you'd use axios with onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadService.uploadFile(file, endpoint, uploadOptions);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        options.onSuccess?.(result.data);
        return result;
      } else {
        setError(result.message || 'Upload failed');
        options.onError?.(result.message || 'Upload failed');
        return result;
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      options.onError?.(error.message || 'Upload failed');
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const uploadMultipleFiles = async (files: File[], endpoint?: string, uploadOptions?: any) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadService.uploadMultipleFiles(files, endpoint, uploadOptions);

      if (result.success) {
        options.onSuccess?.(result.data);
        return result;
      } else {
        setError(result.message || 'Upload failed');
        options.onError?.(result.message || 'Upload failed');
        return result;
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      options.onError?.(error.message || 'Upload failed');
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    } finally {
      setIsUploading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    error,
    clearError
  };
};

// Specialized upload hooks
export const useProductImageUpload = (productId?: string) => {
  const upload = useUpload();

  const uploadProductImage = (file: File) => {
    return upload.uploadFile(file, '/upload', { 
      folder: productId ? `aurocom/products/${productId}` : 'aurocom/products' 
    });
  };

  const uploadProductImages = (files: File[]) => {
    return upload.uploadMultipleFiles(files, '/upload-multiple', { 
      folder: productId ? `aurocom/products/${productId}` : 'aurocom/products' 
    });
  };

  return {
    ...upload,
    uploadProductImage,
    uploadProductImages
  };
};

export const useUserAvatarUpload = (userId: string) => {
  const upload = useUpload();

  const uploadAvatar = (file: File) => {
    return upload.uploadFile(file, '/upload', { 
      folder: `aurocom/users/${userId}/avatar`,
      transformation: {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto'
      }
    });
  };

  return {
    ...upload,
    uploadAvatar
  };
};

export const useCategoryImageUpload = (categoryId?: string) => {
  const upload = useUpload();

  const uploadCategoryImage = (file: File) => {
    return upload.uploadFile(file, '/upload', { 
      folder: categoryId ? `aurocom/categories/${categoryId}` : 'aurocom/categories',
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto'
      }
    });
  };

  return {
    ...upload,
    uploadCategoryImage
  };
};