import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { Cart, CartItem, Product, Coupon } from '@/types';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    // Actions
    getCart: () => Promise<void>;
    addToCart: (product: Product, quantity?: number, variant?: any) => Promise<void>;
    updateCartItem: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => Promise<void>;
    // Computed values
    itemCount: number;
    totalAmount: number;
    discountAmount: number;
    // Helper methods
    isInCart: (productId: string, variant?: any) => boolean;
    getCartItem: (productId: string, variant?: any) => CartItem | undefined;
    clearError: () => void;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            isLoading: false,
            error: null,

            // Computed values
            get itemCount() {
                const cart = get().cart;
                return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
            },

            get totalAmount() {
                return get().cart?.total || 0;
            },

            get discountAmount() {
                return get().cart?.discount || 0;
            },

            // Actions
            getCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    console.log('🔄 Fetching cart from API...');
                    const response = await apiClient.getCart();
                    console.log('📦 Full API Response:', response);

                    if (response.success) {
                        console.log('✅ Cart data received:', response.data);
                        console.log('🛍️ Cart items:', response.data.cart?.items);
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        console.error('❌ API returned error:', response.message);
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    console.error('💥 Failed to fetch cart:', error);
                    console.error('Error details:', error.response?.data);
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to fetch cart',
                    });
                }
            },

            addToCart: async (product: Product, quantity: number = 1, variant?: any) => {
                set({ isLoading: true, error: null });
                try {
                    console.log('🛒 Adding to cart:', {
                        productId: product._id,
                        productName: product.name,
                        quantity,
                        variant
                    });

                    const response = await apiClient.addToCart({
                        productId: product._id,
                        quantity,
                        variant,
                    });

                    console.log('📦 Add to cart response:', response);

                    if (response.success) {
                        console.log('✅ Cart after adding:', response.data.cart);
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    console.error('❌ Add to cart error:', error);
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to add item to cart',
                    });
                    throw error;
                }
            },

            updateCartItem: async (itemId: string, quantity: number) => {
                // 🛠️ FIX: Remove item when quantity is less than 1
                if (quantity < 1) {
                    await get().removeFromCart(itemId);
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.updateCartItem(itemId, quantity);

                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to update cart item',
                    });
                }
            },

            removeFromCart: async (itemId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.removeFromCart(itemId);

                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to remove item from cart',
                    });
                }
            },

            clearCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.clearCart();

                    if (response.success) {
                        set({ cart: null, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to clear cart',
                    });
                }
            },

            applyCoupon: async (code: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.applyCoupon(code);

                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to apply coupon',
                    });
                    throw error;
                }
            },

            removeCoupon: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.removeCoupon();

                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to remove coupon',
                    });
                }
            },

            // Helper methods
            isInCart: (productId: string, variant?: any) => {
                const cart = get().cart;
                if (!cart) return false;

                return cart.items.some(item => {
                    const productMatch = item.product._id === productId;
                    const variantMatch = !variant || JSON.stringify(item.variant) === JSON.stringify(variant);
                    return productMatch && variantMatch;
                });
            },

            getCartItem: (productId: string, variant?: any) => {
                const cart = get().cart;
                if (!cart) return undefined;

                return cart.items.find(item => {
                    const productMatch = item.product._id === productId;
                    const variantMatch = !variant || JSON.stringify(item.variant) === JSON.stringify(variant);
                    return productMatch && variantMatch;
                });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
// // Custom hook for cart operations
// export const useCartOperations = () => {
//     const {
//         addToCart,
//         updateCartItem,
//         removeFromCart,
//         isInCart,
//         getCartItem,
//     } = useCart();

//     const addOrUpdateCartItem = async (product: Product, quantity: number = 1, variant?: any) => {
//         const existingItem = getCartItem(product._id, variant);

//         if (existingItem) {
//             const newQuantity = existingItem.quantity + quantity;
//             await updateCartItem(existingItem._id, newQuantity);
//         } else {
//             await addToCart(product, quantity, variant);
//         }
//     };

//     const incrementQuantity = async (itemId: string, currentQuantity: number) => {
//         await updateCartItem(itemId, currentQuantity + 1);
//     };

//     const decrementQuantity = async (itemId: string, currentQuantity: number) => {
//         if (currentQuantity > 1) {
//             await updateCartItem(itemId, currentQuantity - 1);
//         }
//     };

//     return {
//         addOrUpdateCartItem,
//         incrementQuantity,
//         decrementQuantity,
//         isInCart,
//         getCartItem,
//     };
// };