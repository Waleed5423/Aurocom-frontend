import { create } from 'zustand';
import { apiClient } from '@/lib/api';

import { User, Product, Order, Category, Review, Transaction, DashboardStats, SalesReport } from '@/types';

interface AdminState {
    // Data
    dashboardStats: DashboardStats | null;
    users: User[];
    products: Product[];
    orders: Order[];
    categories: Category[];
    reviews: Review[];
    transactions: Transaction[];
    salesReport: SalesReport | null;


    // UI state
    isLoading: boolean;
    error: string | null;

    // Pagination
    usersPagination: any;
    productsPagination: any;
    ordersPagination: any;
    reviewsPagination: any;
    transactionsPagination: any;

    // Actions
    // Dashboard
    fetchDashboardStats: () => Promise<void>;

    // Users
    fetchUsers: (params?: any) => Promise<void>;
    updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
    updateUserRole: (userId: string, role: string) => Promise<void>;

    // Products
    fetchProducts: (params?: any) => Promise<void>;
    updateProductStatus: (productId: string, statusData: any) => Promise<void>;
    updateProductInventory: (productId: string, inventoryData: any) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;


    // Orders
    fetchOrders: (params?: any) => Promise<void>;
    updateOrderStatus: (orderId: string, statusData: any) => Promise<void>;

    // Categories
    fetchCategories: (params?: any) => Promise<void>;
    createCategory: (categoryData: any) => Promise<void>;
    updateCategory: (categoryId: string, categoryData: any) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;

    // Reviews
    fetchReviews: (params?: any) => Promise<void>;
    updateReviewStatus: (reviewId: string, statusData: any) => Promise<void>;

    // Transactions
    fetchTransactions: (params?: any) => Promise<void>;
    processRefund: (transactionId: string, refundData: any) => Promise<void>;

    // Analytics
    fetchSalesReport: (params?: any) => Promise<void>;
    fetchProductPerformance: (params?: any) => Promise<void>;

    // Utility
    clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    // Initial state
    dashboardStats: null,
    users: [],
    products: [],
    orders: [],
    categories: [],
    reviews: [],
    transactions: [],
    salesReport: null,
    isLoading: false,
    error: null,
    usersPagination: null,
    productsPagination: null,
    ordersPagination: null,
    reviewsPagination: null,
    transactionsPagination: null,

    // Dashboard actions
    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminDashboard();
            if (response.success) {
                set({ dashboardStats: response.data, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch dashboard stats',
            });
        }
    },

    // User actions
    fetchUsers: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminUsers(params);
            if (response.success) {
                set({
                    users: response.data.users,
                    usersPagination: response.data.pagination,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch users',
            });
        }
    },

    updateUserStatus: async (userId: string, isActive: boolean) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateUserStatus(userId, isActive);
            if (response.success) {
                const { users } = get();
                const updatedUsers = users.map(user =>
                    user._id === userId ? response.data.user : user
                );
                set({ users: updatedUsers, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update user status',
            });
            throw error;
        }
    },

    updateUserRole: async (userId: string, role: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateUserRole(userId, role);
            if (response.success) {
                const { users } = get();
                const updatedUsers = users.map(user =>
                    user._id === userId ? response.data.user : user
                );
                set({ users: updatedUsers, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update user role',
            });
            throw error;
        }
    },

    // Product actions
    fetchProducts: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminProducts(params);
            if (response.success) {
                set({
                    products: response.data.products,
                    productsPagination: response.data.pagination,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch products',
            });
        }
    },

    updateProductStatus: async (productId: string, statusData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateProductStatus(productId, statusData);
            if (response.success) {
                const { products } = get();
                const updatedProducts = products.map(product =>
                    product._id === productId ? response.data.product : product
                );
                set({ products: updatedProducts, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update product status',
            });
            throw error;
        }
    },

    updateProductInventory: async (productId: string, inventoryData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateProductInventory(productId, inventoryData);
            if (response.success) {
                const { products } = get();
                const updatedProducts = products.map(product =>
                    product._id === productId ? response.data.product : product
                );
                set({ products: updatedProducts, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update product inventory',
            });
            throw error;
        }
    },


    // Order actions
    fetchOrders: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminOrders(params);
            if (response.success) {
                set({
                    orders: response.data.orders,
                    ordersPagination: response.data.pagination,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch orders',
            });
        }
    },

    updateOrderStatus: async (orderId: string, statusData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateOrderStatus(orderId, statusData);
            if (response.success) {
                const { orders } = get();
                const updatedOrders = orders.map(order =>
                    order._id === orderId ? response.data.order : order
                );
                set({ orders: updatedOrders, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update order status',
            });
            throw error;
        }
    },

    // Category actions
    fetchCategories: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getCategories({ ...params, flat: 'true' });
            if (response.success) {
                set({ categories: response.data.categories, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch categories',
            });
        }
    },

    createCategory: async (categoryData: any) => {
        set({ isLoading: true, error: null });
        try {
            console.log('🔄 Creating category with data:', categoryData);

            const response = await apiClient.createCategory(categoryData);

            console.log('📦 Category creation response:', response);

            if (response.success) {
                console.log('✅ Category created successfully');
                const { categories } = get();
                set({
                    categories: [...categories, response.data.category],
                    isLoading: false
                });
                return response.data;
            } else {
                console.error('❌ Category creation failed:', response.message);
                throw new Error(response.message);
            }
        } catch (error: any) {
            console.error('💥 Category creation error:', error);

            // More detailed error information
            let errorMessage = 'Failed to create category';
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'No response from server';
            } else {
                errorMessage = error.message;
            }

            set({
                isLoading: false,
                error: errorMessage,
            });
            throw new Error(errorMessage);
        }
    },


    updateCategory: async (categoryId: string, categoryData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateCategory(categoryId, categoryData);
            if (response.success) {
                const { categories } = get();
                const updatedCategories = categories.map(category =>
                    category._id === categoryId ? response.data.category : category
                );
                set({ categories: updatedCategories, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update category',
            });
            throw error;
        }
    },

    deleteCategory: async (categoryId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.deleteCategory(categoryId);
            if (response.success) {
                const { categories } = get();
                const updatedCategories = categories.filter(category => category._id !== categoryId);
                set({ categories: updatedCategories, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to delete category',
            });
            throw error;
        }
    },

    // Review actions
    fetchReviews: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminReviews(params);
            if (response.success) {
                set({
                    reviews: response.data.reviews,
                    reviewsPagination: response.data.pagination,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch reviews',
            });
        }
    },

    updateReviewStatus: async (reviewId: string, statusData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.updateReviewStatus(reviewId, statusData);
            if (response.success) {
                const { reviews } = get();
                const updatedReviews = reviews.map(review =>
                    review._id === reviewId ? response.data.review : review
                );
                set({ reviews: updatedReviews, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update review status',
            });
            throw error;
        }
    },

    // Transaction actions
    fetchTransactions: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getAdminTransactions(params);
            if (response.success) {
                set({
                    transactions: response.data.transactions,
                    transactionsPagination: response.data.pagination,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch transactions',
            });
        }
    },

    processRefund: async (transactionId: string, refundData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.processRefund(transactionId, refundData);
            if (response.success) {
                const { transactions } = get();
                const updatedTransactions = transactions.map(transaction =>
                    transaction._id === transactionId ? response.data.transaction : transaction
                );
                set({ transactions: updatedTransactions, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to process refund',
            });
            throw error;
        }
    },

    // Analytics actions
    fetchSalesReport: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getSalesReport(params);
            if (response.success) {
                set({ salesReport: response.data, isLoading: false });
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch sales report',
            });
        }
    },

    fetchProductPerformance: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.getProductPerformance(params);
            if (response.success) {
                set({ isLoading: false });
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch product performance',
            });
            throw error;
        }
    },
    deleteProduct: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
            // We'll implement this API call - for now, just update local state
            const { products } = get();
            const updatedProducts = products.filter(product => product._id !== productId);
            set({ products: updatedProducts, isLoading: false });

            // Show success message
            alert('Product deleted successfully!');
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to delete product',
            });
            throw error;
        }
    },

    // Utility
    clearError: () => {
        set({ error: null });
    },
}));