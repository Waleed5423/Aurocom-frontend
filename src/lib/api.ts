import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { LoginResponse, RefreshTokenResponse, ErrorResponse } from '@/types/api';
import { ApiResponse } from '@/types';

class ApiClient {
    private client: AxiosInstance;
    private refreshTokenRequest: Promise<string> | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
            timeout: 30000,
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ErrorResponse>) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await this.refreshAuthToken();
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        this.clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    public getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    private getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refreshToken');
        }
        return null;
    }

    private setRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token);
        }
    }

    private clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    private async refreshAuthToken(): Promise<string> {
        if (this.refreshTokenRequest) {
            return this.refreshTokenRequest;
        }

        this.refreshTokenRequest = new Promise(async (resolve, reject) => {
            try {
                const refreshToken = this.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
                    { refreshToken }
                );

                if (response.data.success) {
                    this.setToken(response.data.data.token);
                    this.setRefreshToken(response.data.data.refreshToken);
                    resolve(response.data.data.token);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (error) {
                this.clearTokens();
                reject(error);
            } finally {
                this.refreshTokenRequest = null;
            }
        });

        return this.refreshTokenRequest;
    }

    // Auth API methods
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/auth/login', {
            email,
            password,
        });

        if (response.data.success) {
            this.setToken(response.data.data.token);
            this.setRefreshToken(response.data.data.refreshToken);
        }

        return response.data;
    }

    async register(userData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/auth/register', userData);

        if (response.data.success) {
            this.setToken(response.data.data.token);
            this.setRefreshToken(response.data.data.refreshToken);
        }

        return response.data;
    }

    async forgotPassword(email: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(token: string, password: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/auth/reset-password', {
            token,
            password,
        });
        return response.data;
    }

    async logout(): Promise<void> {
        this.clearTokens();
    }

    // User API methods
    async getProfile(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/users/profile');
        return response.data;
    }

    async updateProfile(profileData: any): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>('/users/profile', profileData);
        return response.data;
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>('/users/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    }

    // Product API methods
    async getProducts(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/products', { params });
        return response.data;
    }

    async getProduct(id: string): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>(`/products/${id}`);
        return response.data;
    }

    async getFeaturedProducts(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/products/featured');
        return response.data;
    }

    // Cart API methods
    async getCart(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/cart');
        return response.data;
    }

    async addToCart(productData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/cart/add', productData);
        return response.data;
    }

    async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>(`/cart/item/${itemId}`, { quantity });
        return response.data;
    }

    async removeFromCart(itemId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/cart/item/${itemId}`);
        return response.data;
    }

    async clearCart(): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>('/cart/clear');
        return response.data;
    }

    async applyCoupon(code: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/cart/coupon/apply', { code });
        return response.data;
    }

    async removeCoupon(): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>('/cart/coupon/remove');
        return response.data;
    }

    // Order API methods
    async createOrder(orderData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/orders', orderData);
        return response.data;
    }

    async getUserOrders(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/orders', { params });
        return response.data;
    }

    async getOrder(id: string): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>(`/orders/${id}`);
        return response.data;
    }

    async cancelOrder(id: string): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/orders/${id}/cancel`);
        return response.data;
    }

    // Payment API methods
    async createPaymentIntent(paymentData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/payments/create-intent', paymentData);
        return response.data;
    }

    async confirmPayment(confirmData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/payments/confirm', confirmData);
        return response.data;
    }

    async getPaymentMethods(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/payments/methods');
        return response.data;
    }

    // Review API methods
    async createReview(reviewData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/reviews', reviewData);
        return response.data;
    }

    async getProductReviews(productId: string, params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>(`/reviews/product/${productId}`, { params });
        return response.data;
    }

    async updateReview(id: string, reviewData: any): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>(`/reviews/${id}`, reviewData);
        return response.data;
    }

    async deleteReview(id: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/reviews/${id}`);
        return response.data;
    }

    async markReviewHelpful(id: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>(`/reviews/${id}/helpful`);
        return response.data;
    }

    // Category API methods
    async getCategories(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/categories', { params });
        return response.data;
    }

    async getCategory(id: string): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>(`/categories/${id}`);
        return response.data;
    }

    async getCategoryProducts(categoryId: string, params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>(`/categories/${categoryId}/products`, { params });
        return response.data;
    }

    // Wishlist API methods
    async getWishlist(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/users/wishlist');
        return response.data;
    }

    async addToWishlist(productId: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/users/wishlist', { productId });
        return response.data;
    }

    async removeFromWishlist(productId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/users/wishlist/${productId}`);
        return response.data;
    }

    // Address API methods
    async getAddresses(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/users/addresses');
        return response.data;
    }

    async addAddress(addressData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/users/addresses', addressData);
        return response.data;
    }

    async updateAddress(addressId: string, addressData: any): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>(`/users/addresses/${addressId}`, addressData);
        return response.data;
    }

    async deleteAddress(addressId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/users/addresses/${addressId}`);
        return response.data;
    }

    // Notification API methods
    async getNotifications(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/notifications', { params });
        return response.data;
    }

    async markNotificationAsRead(id: string): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/notifications/${id}/read`);
        return response.data;
    }

    async markAllNotificationsAsRead(): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>('/notifications/read-all');
        return response.data;
    }

    async deleteNotification(id: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/notifications/${id}`);
        return response.data;
    }

    // Admin API methods
    async getAdminDashboard(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/dashboard');
        return response.data;
    }

    async getAdminUsers(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/users', { params });
        return response.data;
    }

    async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/users/${userId}/status`, { isActive });
        return response.data;
    }

    async updateUserRole(userId: string, role: string): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/users/${userId}/role`, { role });
        return response.data;
    }

    async getAdminOrders(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/orders', { params });
        return response.data;
    }

    async updateOrderStatus(orderId: string, statusData: any): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/orders/${orderId}/status`, statusData);
        return response.data;
    }

    async getAdminProducts(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/products', { params });
        return response.data;
    }

    async updateProductStatus(productId: string, statusData: any): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/products/${productId}/status`, statusData);
        return response.data;
    }

    async updateProductInventory(productId: string, inventoryData: any): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/products/${productId}/inventory`, inventoryData);
        return response.data;
    }

    async createCategory(categoryData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/admin/categories', categoryData);
        return response.data;
    }

    async updateCategory(categoryId: string, categoryData: any): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>(`/admin/categories/${categoryId}`, categoryData);
        return response.data;
    }

    async deleteCategory(categoryId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/admin/categories/${categoryId}`);
        return response.data;
    }

    async getAdminReviews(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/reviews', { params });
        return response.data;
    }

    async updateReviewStatus(reviewId: string, statusData: any): Promise<ApiResponse> {
        const response = await this.client.patch<ApiResponse>(`/admin/reviews/${reviewId}/status`, statusData);
        return response.data;
    }

    async getSalesReport(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/analytics/sales', { params });
        return response.data;
    }

    async getProductPerformance(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/analytics/products', { params });
        return response.data;
    }
    async getUserDashboard(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/users/dashboard');
        return response.data;
    }

    // Admin Transactions
    async getAdminTransactions(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/transactions', { params });
        return response.data;
    }

    async processRefund(transactionId: string, refundData: any): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>(`/admin/transactions/${transactionId}/refund`, refundData);
        return response.data;
    }

    // Clear all notifications
    async clearAllNotifications(): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>('/notifications');
        return response.data;
    }

    // File upload method
    async uploadFile(file: File, endpoint: string = '/upload'): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.client.post<ApiResponse>(endpoint, formData);

        return response.data;
    }

    async uploadMultipleFiles(files: File[], endpoint: string = '/upload-multiple'): Promise<ApiResponse> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await this.client.post<ApiResponse>(endpoint, formData);

        return response.data;
    }

    async deleteUploadedFile(publicId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/upload/${publicId}`);
        return response.data;
    }

    async getAdminCoupons(params?: any): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/admin/coupons', { params });
        return response.data;
    }
    async deleteProduct(productId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/products/${productId}`);
        return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient;