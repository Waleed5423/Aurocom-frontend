// src/app/(shop)/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { Cart as CartType, Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { cart, getCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon, clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            await getCart();
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(itemId, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            await removeFromCart(itemId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setApplyingCoupon(true);
        setCouponError('');

        try {
            await applyCoupon(couponCode);
            setCouponCode('');
        } catch (error: any) {
            setCouponError(error.message || 'Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await removeCoupon();
        } catch (error) {
            console.error('Failed to remove coupon:', error);
        }
    };

    const handleClearCart = async () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearCart();
            } catch (error) {
                console.error('Failed to clear cart:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Start shopping to add items to your cart
                        </p>
                        <Button asChild size="lg">
                            <Link href="/products">
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">
                        {cart.items.reduce((total, item) => total + item.quantity, 0)} items in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Cart Items</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearCart}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Clear Cart
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="p-6 flex items-center space-x-4">
                                            {/* Product Image */}
                                            <Link
                                                href={`/product/${item.product._id}`}
                                                className="flex-shrink-0"
                                            >
                                                <img
                                                    src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/product/${item.product._id}`}
                                                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                {item.variant && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.variant.name}: {item.variant.value}
                                                    </p>
                                                )}
                                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                                    ${item.price}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                    disabled={!item.product.inStock}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="text-red-600 hover:text-red-700 mt-2"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Coupon Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Apply Coupon
                                    </label>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={applyingCoupon || !couponCode.trim()}
                                        >
                                            {applyingCoupon ? 'Applying...' : 'Apply'}
                                        </Button>
                                    </div>
                                    {couponError && (
                                        <p className="text-sm text-red-600">{couponError}</p>
                                    )}
                                    {cart.coupon && (
                                        <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                                            <span className="text-sm text-green-800">
                                                Coupon {cart.coupon.code} applied
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveCoupon}
                                                className="text-green-800 hover:text-green-900"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 pt-4 border-t">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${cart.subtotal?.toFixed(2)}</span>
                                    </div>

                                    {cart.shipping > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-medium">${cart.shipping?.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {cart.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-medium">${cart.tax?.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {cart.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-${cart.discount?.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span>${cart.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button asChild className="w-full" size="lg">
                                    <Link href="/checkout">
                                        Proceed to Checkout
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/products">
                                        Continue Shopping
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Additional Info */}
                        <Card className="mt-6">
                            <CardContent className="p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Free Shipping</h3>
                                <p className="text-sm text-gray-600">
                                    Free standard shipping on orders over $50
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}