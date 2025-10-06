// src/app/(shop)/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/api';
import { Address, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Truck, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { cart, getCart } = useCart();
    const { addresses, fetchAddresses } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        // Shipping
        shippingAddress: '',
        useDifferentBilling: false,

        // Billing
        billingAddress: '',

        // Payment
        paymentMethod: '',

        // Additional
        notes: ''
    });

    // New address form
    const [newAddress, setNewAddress] = useState({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
            return;
        }
        loadData();
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            await Promise.all([
                getCart(),
                fetchAddresses(),
                fetchPaymentMethods()
            ]);
        } catch (error) {
            console.error('Failed to load checkout data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await apiClient.getPaymentMethods();
            if (response.success) {
                setPaymentMethods(response.data.methods);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        }
    };

    const handleAddAddress = async () => {
        try {
            await useUserStore.getState().addAddress(newAddress);
            await fetchAddresses();
            setNewAddress({
                name: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                isDefault: false
            });
        } catch (error) {
            console.error('Failed to add address:', error);
        }
    };

    const handlePlaceOrder = async () => {
        if (!cart || !formData.shippingAddress || !formData.paymentMethod) return;

        setProcessing(true);
        try {
            const shippingAddress = addresses.find(addr => addr._id === formData.shippingAddress);
            const billingAddress = formData.useDifferentBilling
                ? addresses.find(addr => addr._id === formData.billingAddress)
                : shippingAddress;

            if (!shippingAddress || !billingAddress) {
                throw new Error('Please select valid addresses');
            }

            const orderData = {
                shippingAddress: {
                    name: shippingAddress.name,
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    zipCode: shippingAddress.zipCode,
                    country: shippingAddress.country
                },
                billingAddress: {
                    name: billingAddress.name,
                    street: billingAddress.street,
                    city: billingAddress.city,
                    state: billingAddress.state,
                    zipCode: billingAddress.zipCode,
                    country: billingAddress.country
                },
                paymentMethod: formData.paymentMethod,
                notes: formData.notes
            };

            const response = await apiClient.createOrder(orderData);

            if (response.success) {
                // Redirect to order confirmation
                router.push(`/orders/${response.data.order._id}?success=true`);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            alert(error.message || 'Failed to place order');
        } finally {
            setProcessing(false);
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <Button asChild>
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        {['Shipping', 'Payment', 'Review'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step > index + 1
                                            ? 'bg-green-600 text-white'
                                            : step === index + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-300 text-gray-600'
                                        }`}
                                >
                                    {step > index + 1 ? '✓' : index + 1}
                                </div>
                                <span
                                    className={`ml-2 font-medium ${step >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                                        }`}
                                >
                                    {stepName}
                                </span>
                                {index < 2 && (
                                    <div
                                        className={`w-16 h-1 mx-4 ${step > index + 1 ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Shipping Address */}
                        {step === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Truck className="h-6 w-6 mr-2" />
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Saved Addresses */}
                                    <div>
                                        <Label className="text-sm font-medium mb-4 block">
                                            Select Shipping Address
                                        </Label>
                                        <RadioGroup
                                            value={formData.shippingAddress}
                                            onValueChange={(value) => setFormData(prev => ({
                                                ...prev,
                                                shippingAddress: value
                                            }))}
                                        >
                                            {addresses.map((address) => (
                                                <div key={address._id} className="flex items-center space-x-3 mb-4">
                                                    <RadioGroupItem value={address._id} id={`shipping-${address._id}`} />
                                                    <Label htmlFor={`shipping-${address._id}`} className="flex-1">
                                                        <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                                                            <p className="font-medium">{address.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {address.street}, {address.city}, {address.state} {address.zipCode}
                                                            </p>
                                                            {address.isDefault && (
                                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {/* Add New Address */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-medium mb-4">Add New Address</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Full Name"
                                                value={newAddress.name}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="Street Address"
                                                value={newAddress.street}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="ZIP Code"
                                                value={newAddress.zipCode}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="Country"
                                                value={newAddress.country}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 mt-4">
                                            <input
                                                type="checkbox"
                                                id="default-address"
                                                checked={newAddress.isDefault}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                                            />
                                            <Label htmlFor="default-address">Set as default address</Label>
                                        </div>
                                        <Button
                                            onClick={handleAddAddress}
                                            disabled={!newAddress.name || !newAddress.street || !newAddress.city}
                                            className="mt-4"
                                        >
                                            Add Address
                                        </Button>
                                    </div>

                                    {/* Billing Address Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="different-billing"
                                            checked={formData.useDifferentBilling}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                useDifferentBilling: e.target.checked
                                            }))}
                                        />
                                        <Label htmlFor="different-billing">
                                            Use different billing address
                                        </Label>
                                    </div>

                                    {formData.useDifferentBilling && (
                                        <div>
                                            <Label className="text-sm font-medium mb-4 block">
                                                Select Billing Address
                                            </Label>
                                            <Select
                                                value={formData.billingAddress}
                                                onValueChange={(value) => setFormData(prev => ({
                                                    ...prev,
                                                    billingAddress: value
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select billing address" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {addresses.map((address) => (
                                                        <SelectItem key={address._id} value={address._id}>
                                                            {address.name} - {address.street}, {address.city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-4">
                                        <Button asChild variant="outline">
                                            <Link href="/cart">
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Back to Cart
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={() => setStep(2)}
                                            disabled={!formData.shippingAddress}
                                        >
                                            Continue to Payment
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="h-6 w-6 mr-2" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <RadioGroup
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            paymentMethod: value
                                        }))}
                                    >
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className="flex items-center space-x-3 mb-4">
                                                <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                                                <Label htmlFor={`payment-${method.id}`} className="flex-1">
                                                    <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{method.name}</p>
                                                                <p className="text-sm text-gray-600">{method.description}</p>
                                                            </div>
                                                            <span className="text-2xl">{method.icon}</span>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {/* Order Notes */}
                                    <div>
                                        <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                                            Order Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Any special instructions for your order..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button variant="outline" onClick={() => setStep(1)}>
                                            Back to Shipping
                                        </Button>
                                        <Button
                                            onClick={() => setStep(3)}
                                            disabled={!formData.paymentMethod}
                                        >
                                            Review Order
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Order Review */}
                        {step === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="h-6 w-6 mr-2" />
                                        Review Your Order
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Order Items */}
                                    <div>
                                        <h3 className="font-medium mb-4">Order Items</h3>
                                        <div className="space-y-4">
                                            {cart.items.map((item) => (
                                                <div key={item._id} className="flex items-center justify-between border-b pb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                                                            alt={item.product.name}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{item.product.name}</p>
                                                            {item.variant && (
                                                                <p className="text-sm text-gray-600">
                                                                    {item.variant.name}: {item.variant.value}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipping & Payment Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-medium mb-2">Shipping Address</h3>
                                            {(() => {
                                                const address = addresses.find(addr => addr._id === formData.shippingAddress);
                                                return address ? (
                                                    <div className="text-sm text-gray-600">
                                                        <p>{address.name}</p>
                                                        <p>{address.street}</p>
                                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                                        <p>{address.country}</p>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">Payment Method</h3>
                                            <p className="text-sm text-gray-600">
                                                {paymentMethods.find(m => m.id === formData.paymentMethod)?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button variant="outline" onClick={() => setStep(2)}>
                                            Back to Payment
                                        </Button>
                                        <Button
                                            onClick={handlePlaceOrder}
                                            disabled={processing}
                                            size="lg"
                                        >
                                            {processing ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${cart.subtotal?.toFixed(2)}</span>
                                    </div>
                                    {cart.shipping > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>${cart.shipping?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {cart.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax</span>
                                            <span>${cart.tax?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {cart.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-${cart.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span>${cart.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Badge */}
                        <Card className="mt-6">
                            <CardContent className="p-4 text-center">
                                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                    Secure checkout guaranteed
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}