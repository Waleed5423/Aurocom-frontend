import { useCart } from './useCart';
import { Product } from '@/types';

export const useCartOperations = () => {
    const {
        addToCart,
        updateCartItem,
        removeFromCart,
        isInCart,
        getCartItem,
    } = useCart();

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
            // This will now trigger removal via the fixed updateCartItem
            await updateCartItem(itemId, 0);
        }
    };

    const removeItem = async (itemId: string) => {
        await removeFromCart(itemId);
    };

    const getItemQuantity = (productId: string, variant?: any) => {
        const item = getCartItem(productId, variant);
        return item ? item.quantity : 0;
    };

    return {
        addOrUpdateCartItem,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        isInCart,
        getCartItem,
        getItemQuantity,
    };
};