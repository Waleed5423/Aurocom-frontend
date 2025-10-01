import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { User, Address, Order, Review } from '@/types';

interface UserState {
  // User data
  user: User | null;
  addresses: Address[];
  orders: Order[];
  wishlist: string[];
  reviews: Review[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // User actions
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  
  // Address actions
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, '_id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  
  // Order actions
  fetchOrders: (params?: any) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  
  // Wishlist actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  
  // Review actions
  fetchUserReviews: (params?: any) => Promise<void>;
  
  // Dashboard actions
  fetchDashboardStats: () => Promise<any>;
  
  // Utility
  clearError: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      addresses: [],
      orders: [],
      wishlist: [],
      reviews: [],
      isLoading: false,
      error: null,

      // User actions
      setUser: (user: User) => {
        set({ user });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      // Address actions
      fetchAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getAddresses();
          if (response.success) {
            set({ addresses: response.data.addresses, isLoading: false });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch addresses',
          });
        }
      },

      addAddress: async (addressData: Omit<Address, '_id'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.addAddress(addressData);
          if (response.success) {
            const { addresses } = get();
            set({ 
              addresses: response.data.addresses,
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to add address',
          });
          throw error;
        }
      },

      updateAddress: async (addressId: string, addressData: Partial<Address>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateAddress(addressId, addressData);
          if (response.success) {
            const { addresses } = get();
            set({ 
              addresses: response.data.addresses,
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to update address',
          });
          throw error;
        }
      },

      deleteAddress: async (addressId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.deleteAddress(addressId);
          if (response.success) {
            const { addresses } = get();
            set({ 
              addresses: response.data.addresses,
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to delete address',
          });
          throw error;
        }
      },

      setDefaultAddress: async (addressId: string) => {
        const { addresses } = get();
        const updatedAddresses = addresses.map(address => ({
          ...address,
          isDefault: address._id === addressId,
        }));

        // Find the address to update
        const addressToUpdate = addresses.find(addr => addr._id === addressId);
        if (addressToUpdate) {
          await get().updateAddress(addressId, { isDefault: true });
        }
      },

      // Order actions
      fetchOrders: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getUserOrders(params);
          if (response.success) {
            set({ 
              orders: response.data.orders,
              isLoading: false 
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

      fetchOrder: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getOrder(orderId);
          if (response.success) {
            set({ isLoading: false });
            return response.data.order;
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch order',
          });
          return null;
        }
      },

      cancelOrder: async (orderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.cancelOrder(orderId);
          if (response.success) {
            // Update the order in local state
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
            error: error.response?.data?.message || error.message || 'Failed to cancel order',
          });
          throw error;
        }
      },

      // Wishlist actions
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getWishlist();
          if (response.success) {
            const wishlistItems = response.data.wishlist.map((item: any) => item._id);
            set({ 
              wishlist: wishlistItems,
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch wishlist',
          });
        }
      },

      addToWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.addToWishlist(productId);
          if (response.success) {
            const { wishlist } = get();
            set({ 
              wishlist: [...wishlist, productId],
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to add to wishlist',
          });
          throw error;
        }
      },

      removeFromWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.removeFromWishlist(productId);
          if (response.success) {
            const { wishlist } = get();
            set({ 
              wishlist: wishlist.filter(id => id !== productId),
              isLoading: false 
            });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to remove from wishlist',
          });
          throw error;
        }
      },

      isInWishlist: (productId: string) => {
        const { wishlist } = get();
        return wishlist.includes(productId);
      },

      // Review actions
      fetchUserReviews: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
          // This would need to be implemented in the API
          // For now, we'll use a placeholder
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch reviews',
          });
        }
      },

      // Dashboard actions
      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getUserDashboard();
          if (response.success) {
            set({ isLoading: false });
            return response.data;
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch dashboard stats',
          });
          throw error;
        }
      },

      // Utility methods
      clearError: () => {
        set({ error: null });
      },

      clearUser: () => {
        set({
          user: null,
          addresses: [],
          orders: [],
          wishlist: [],
          reviews: [],
          error: null,
        });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        addresses: state.addresses,
        wishlist: state.wishlist,
      }),
    }
  )
);