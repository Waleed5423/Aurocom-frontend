// store/useCartStore.ts
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
    subtotalAmount: number;
    shippingAmount: number;
    taxAmount: number;

    // Helper methods
    isInCart: (productId: string, variant?: any) => boolean;
    getCartItem: (productId: string, variant?: any) => CartItem | undefined;
    getItemQuantity: (productId: string, variant?: any) => number;
    clearError: () => void;
}

export const useCartStore = create<CartState>()(
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

            get subtotalAmount() {
                return get().cart?.subtotal || 0;
            },

            get shippingAmount() {
                return get().cart?.shipping || 0;
            },

            get taxAmount() {
                return get().cart?.tax || 0;
            },

            // Actions
            getCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.getCart();
                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to fetch cart',
                    });
                }
            },

            addToCart: async (product: Product, quantity: number = 1, variant?: any) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.addToCart({
                        productId: product._id,
                        quantity,
                        variant,
                    });

                    if (response.success) {
                        set({ cart: response.data.cart, isLoading: false });
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Failed to add item to cart',
                    });
                    throw error;
                }
            },

            updateCartItem: async (itemId: string, quantity: number) => {
                if (quantity < 1) {
                    // If quantity is 0, remove the item instead
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

            getItemQuantity: (productId: string, variant?: any) => {
                const item = get().getCartItem(productId, variant);
                return item ? item.quantity : 0;
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

// Custom hook for cart operations
export const useCartOperations = () => {
    const {
        addToCart,
        updateCartItem,
        removeFromCart,
        isInCart,
        getCartItem,
        getItemQuantity,
    } = useCartStore();

    const addOrUpdateCartItem = async (product: Product, quantity: number = 1, variant?: any) => {
        const existingItem = getCartItem(product._id, variant);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await updateCartItem(existingItem._id, newQuantity);
        } else {
            await addToCart(product, quantity, variant);
        }
    };

    const incrementQuantity = async (itemId: string, currentQuantity: number) => {
        await updateCartItem(itemId, currentQuantity + 1);
    };

    const decrementQuantity = async (itemId: string, currentQuantity: number) => {
        if (currentQuantity > 1) {
            await updateCartItem(itemId, currentQuantity - 1);
        } else {
            await removeFromCart(itemId);
        }
    };

    const toggleCartItem = async (product: Product, variant?: any) => {
        const isCurrentlyInCart = isInCart(product._id, variant);

        if (isCurrentlyInCart) {
            const item = getCartItem(product._id, variant);
            if (item) {
                await removeFromCart(item._id);
            }
        } else {
            await addToCart(product, 1, variant);
        }
    };

    return {
        addOrUpdateCartItem,
        incrementQuantity,
        decrementQuantity,
        toggleCartItem,
        isInCart,
        getCartItem,
        getItemQuantity,
    };
};