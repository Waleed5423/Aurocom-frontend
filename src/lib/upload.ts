// src/lib/upload.ts - FIXED ENDPOINTS
import { apiClient } from './api';

export interface UploadResponse {
    success: boolean;
    data?: any;
    message?: string;
}

class UploadService {
    private validateFile(file: File): string | null {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        if (file.size > maxSize) {
            return `File size must be less than ${maxSize / 1024 / 1024}MB`;
        }

        if (!allowedTypes.includes(file.type)) {
            return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
        }

        return null;
    }

    // Single file upload - FIXED PATH
    async uploadFile(file: File): Promise<UploadResponse> {
        try {
            const validationError = this.validateFile(file);
            if (validationError) {
                return {
                    success: false,
                    message: validationError
                };
            }

            const response = await apiClient.uploadFile(file, '/upload/upload');
            return response;
        } catch (error: any) {
            console.error('Upload error:', error);
            return {
                success: false,
                message: error.message || 'Upload failed'
            };
        }
    }

    // Upload multiple files by uploading one by one
    async uploadMultipleFiles(files: File[]): Promise<{ success: boolean; data?: any[]; message?: string }> {
        try {
            const uploadPromises = files.map(file => this.uploadFile(file));
            const results = await Promise.all(uploadPromises);

            const successfulUploads = results.filter(result => result.success);
            const failedUploads = results.filter(result => !result.success);

            if (failedUploads.length > 0) {
                return {
                    success: false,
                    message: `${failedUploads.length} files failed to upload`
                };
            }

            return {
                success: true,
                data: successfulUploads.map(result => result.data)
            };
        } catch (error: any) {
            console.error('Multiple upload error:', error);
            return {
                success: false,
                message: error.message || 'Upload failed'
            };
        }
    }

    // Product image upload
    async uploadProductImages(files: File[]): Promise<{ success: boolean; data?: any[]; message?: string }> {
        return this.uploadMultipleFiles(files);
    }
}

// Export the service instance
export const uploadService = new UploadService();