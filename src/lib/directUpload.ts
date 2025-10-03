// src/lib/directUpload.ts - FIXED ENDPOINTS
export interface UploadResponse {
    success: boolean;
    data?: any;
    message?: string;
}

class DirectUploadService {
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

    // Direct upload without using apiClient - FIXED ENDPOINT
    async uploadFile(file: File): Promise<UploadResponse> {
        try {
            const validationError = this.validateFile(file);
            if (validationError) {
                return {
                    success: false,
                    message: validationError
                };
            }

            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('accessToken');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/upload`, {
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
            console.error('Direct upload error:', error);
            return {
                success: false,
                message: error.message || 'Upload failed'
            };
        }
    }

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
}

export const directUploadService = new DirectUploadService();