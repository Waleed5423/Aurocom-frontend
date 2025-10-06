// src/app/(shop)/product/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const response = await apiClient.getProduct(productId);
            if (response.success) {
                setProduct(response.data.product);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            await addToCart(product, quantity, selectedVariant);
            // You can add a toast notification here
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        // Redirect to cart page
        window.location.href = '/cart';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-600">The product you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                <img
                                    src={product.images[selectedImage]?.url || '/placeholder-product.jpg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square overflow-hidden rounded-md border-2 ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                                                }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center">
                                        <span className="text-yellow-400 text-lg">★</span>
                                        <span className="ml-1 text-gray-600">
                                            {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                                        </span>
                                    </div>
                                    <span className="text-green-600 font-medium">
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                                {product.comparePrice && (
                                    <span className="text-xl text-gray-500 line-through">
                                        ${product.comparePrice}
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 leading-relaxed">{product.description}</p>

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-4">
                                    {product.variants.map((variant, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {variant.name}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {variant.values.map((value, valueIndex) => (
                                                    <button
                                                        key={valueIndex}
                                                        onClick={() => setSelectedVariant({
                                                            name: variant.name,
                                                            value: value.value
                                                        })}
                                                        className={`px-4 py-2 border rounded-md text-sm ${selectedVariant?.name === variant.name &&
                                                                selectedVariant?.value === value.value
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        {value.value} (${value.price})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quantity and Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                    <div className="flex items-center border rounded-md">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 border-r text-gray-600 hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-1 border-l text-gray-600 hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={handleBuyNow}
                                        disabled={!product.inStock}
                                        variant="default"
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">SKU:</span> {product.sku}
                                </div>
                                <div>
                                    <span className="font-medium">Category:</span>{' '}
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                </div>
                                {product.brand && (
                                    <div>
                                        <span className="font-medium">Brand:</span> {product.brand}
                                    </div>
                                )}
                                {product.weight && (
                                    <div>
                                        <span className="font-medium">Weight:</span> {product.weight} kg
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <Tabs defaultValue="description" className="p-8 pt-0">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="specifications">Specifications</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="prose max-w-none">
                                        {product.description.split('\n').map((paragraph, index) => (
                                            <p key={index} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="specifications">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Product Details</h4>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-600">SKU</dt>
                                                    <dd>{product.sku}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-600">Brand</dt>
                                                    <dd>{product.brand || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-gray-600">Weight</dt>
                                                    <dd>{product.weight ? `${product.weight} kg` : 'N/A'}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        {product.dimensions && (
                                            <div>
                                                <h4 className="font-medium mb-2">Dimensions</h4>
                                                <dl className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-600">Length</dt>
                                                        <dd>{product.dimensions.length} cm</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-600">Width</dt>
                                                        <dd>{product.dimensions.width} cm</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-600">Height</dt>
                                                        <dd>{product.dimensions.height} cm</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <Button asChild>
                                            <a href={`/product/${product._id}/reviews`}>
                                                View All Reviews ({product.ratings.count})
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}