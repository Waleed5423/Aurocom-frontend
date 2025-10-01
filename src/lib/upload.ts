import { apiClient } from './api';

export interface UploadResponse {
    success: boolean;
    data?: {
        public_id: string;
        url: string;
        format: string;
        bytes: number;
        width?: number;
        height?: number;
    };
    message?: string;
}

export interface UploadOptions {
    folder?: string;
    transformation?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
    };
}

class UploadService {
    private validateFile(file: File, options: { maxSize?: number; allowedTypes?: string[] } = {}): string | null {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] } = options;

        // Check file size
        if (file.size > maxSize) {
            return `File size must be less than ${maxSize / 1024 / 1024}MB`;
        }

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
        }

        return null;
    }

    // Single file upload
    async uploadFile(
        file: File,
        endpoint: string = '/upload',
        options: UploadOptions = {}
    ): Promise<UploadResponse> {
        try {
            // Validate file
            const validationError = this.validateFile(file);
            if (validationError) {
                return {
                    success: false,
                    message: validationError
                };
            }

            const formData = new FormData();
            formData.append('file', file);

            // Add upload options
            if (options.folder) {
                formData.append('folder', options.folder);
            }

            const response = await apiClient.uploadFile(file, endpoint);

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    message: response.message
                };
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Upload failed'
            };
        }
    }

    // Multiple files upload
    async uploadMultipleFiles(
        files: File[],
        endpoint: string = '/upload-multiple',
        options: UploadOptions = {}
    ): Promise<{ success: boolean; data?: any[]; message?: string }> {
        try {
            // Validate all files first
            for (const file of files) {
                const validationError = this.validateFile(file);
                if (validationError) {
                    return {
                        success: false,
                        message: validationError
                    };
                }
            }

            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append('files', file);
            });

            // Add upload options
            if (options.folder) {
                formData.append('folder', options.folder);
            }

            // Use the apiClient's uploadMultipleFiles method instead of direct fetch
            const response = await apiClient.uploadMultipleFiles(files, endpoint);

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    message: response.message
                };
            }
        } catch (error: any) {
            console.error('Multiple upload error:', error);
            return {
                success: false,
                message: error.message || 'Upload failed'
            };
        }
    }

    // Delete file from Cloudinary - Fixed version
    async deleteFile(publicId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.deleteUploadedFile(publicId);

            if (response.success) {
                return {
                    success: true
                };
            } else {
                return {
                    success: false,
                    message: response.message
                };
            }
        } catch (error: any) {
            console.error('Delete file error:', error);
            return {
                success: false,
                message: error.message || 'Delete failed'
            };
        }
    }


    // Product image upload
    async uploadProductImage(file: File, productId?: string): Promise<UploadResponse> {
        const folder = productId ? `aurocom/products/${productId}` : 'aurocom/products';
        return this.uploadFile(file, '/upload', { folder });
    }

    // Product multiple images upload
    async uploadProductImages(files: File[], productId?: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
        const folder = productId ? `aurocom/products/${productId}` : 'aurocom/products';
        return this.uploadMultipleFiles(files, '/upload-multiple', { folder });
    }

    // User avatar upload
    async uploadUserAvatar(file: File, userId: string): Promise<UploadResponse> {
        const folder = `aurocom/users/${userId}/avatar`;
        return this.uploadFile(file, '/upload', {
            folder,
            transformation: {
                width: 200,
                height: 200,
                crop: 'fill',
                quality: 'auto'
            }
        });
    }

    // Category image upload
    async uploadCategoryImage(file: File, categoryId?: string): Promise<UploadResponse> {
        const folder = categoryId ? `aurocom/categories/${categoryId}` : 'aurocom/categories';
        return this.uploadFile(file, '/upload', {
            folder,
            transformation: {
                width: 400,
                height: 400,
                crop: 'fill',
                quality: 'auto'
            }
        });
    }

    // Review image upload
    async uploadReviewImage(file: File, reviewId?: string): Promise<UploadResponse> {
        const folder = reviewId ? `aurocom/reviews/${reviewId}` : 'aurocom/reviews';
        return this.uploadFile(file, '/upload', { folder });
    }

    // Delete file from Cloudinary
    // async deleteFile(publicId: string): Promise<{ success: boolean; message?: string }> {
    //     try {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/${publicId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Authorization': `Bearer ${apiClient.getToken()}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         const data = await response.json();

    //         if (data.success) {
    //             return {
    //                 success: true
    //             };
    //         } else {
    //             return {
    //                 success: false,
    //                 message: data.message
    //             };
    //         }
    //     } catch (error: any) {
    //         console.error('Delete file error:', error);
    //         return {
    //             success: false,
    //             message: error.message || 'Delete failed'
    //         };
    //     }
    // }

    // Generate Cloudinary URL with transformations
    generateImageUrl(publicId: string, transformations: any = {}): string {
        const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

        const transformationString = Object.entries(transformations)
            .map(([key, value]) => `${key}_${value}`)
            .join(',');

        if (transformationString) {
            return `${baseUrl}/${transformationString}/${publicId}`;
        }

        return `${baseUrl}/${publicId}`;
    }

    // Get optimized image URL for web
    getOptimizedImageUrl(publicId: string, width: number = 800): string {
        return this.generateImageUrl(publicId, {
            w: width,
            h: width,
            c: 'limit',
            q: 'auto',
            f: 'webp'
        });
    }

    // Get thumbnail URL
    getThumbnailUrl(publicId: string, size: number = 150): string {
        return this.generateImageUrl(publicId, {
            w: size,
            h: size,
            c: 'fill',
            q: 'auto',
            f: 'webp'
        });
    }
}

export const uploadService = new UploadService();