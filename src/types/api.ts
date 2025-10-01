import { ApiResponse,DashboardStats, PaginatedResponse } from './index';

// Auth API responses
export interface LoginResponse extends ApiResponse {
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar?: string;
        };
        token: string;
        refreshToken: string;
    };
}

export interface RegisterResponse extends ApiResponse {
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        token: string;
        refreshToken: string;
    };
}

export interface RefreshTokenResponse extends ApiResponse {
    data: {
        token: string;
        refreshToken: string;
    };
}

// Product API responses
export interface ProductsResponse extends ApiResponse {
    data: {
        products: any[];
        pagination: {
            current: number;
            pages: number;
            total: number;
        };
    };
}

export interface ProductResponse extends ApiResponse {
    data: {
        product: any;
    };
}

// Cart API responses
export interface CartResponse extends ApiResponse {
    data: {
        cart: any;
    };
}

// Order API responses
export interface OrdersResponse extends ApiResponse {
    data: {
        orders: any[];
        pagination: {
            current: number;
            pages: number;
            total: number;
        };
    };
}

export interface OrderResponse extends ApiResponse {
    data: {
        order: any;
    };
}

// User API responses
export interface UserProfileResponse extends ApiResponse {
    data: {
        user: any;
    };
}

export interface UserDashboardResponse extends ApiResponse {
    data: {
        stats: {
            orders: number;
            reviews: number;
            wishlist: number;
        };
        recentOrders: any[];
    };
}

// Admin API responses
export interface AdminDashboardResponse extends ApiResponse {
    data: DashboardStats;
}

export interface UsersResponse extends ApiResponse {
    data: {
        users: any[];
        pagination: {
            current: number;
            pages: number;
            total: number;
        };
    };
}

// Error response
export interface ErrorResponse {
    success: false;
    message: string;
    errors?: string[];
}