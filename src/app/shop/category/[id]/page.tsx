// src/app/(shop)/category/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoryProductsPage() {
    const params = useParams();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const { addToCart } = useCart();

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [categoryId, filters]);

    const fetchCategoryAndProducts = async () => {
        try {
            const [categoryResponse, productsResponse] = await Promise.all([
                apiClient.getCategory(categoryId),
                apiClient.getCategoryProducts(categoryId, filters)
            ]);

            if (categoryResponse.success) {
                setCategory(categoryResponse.data.category);
            }

            if (productsResponse.success) {
                setProducts(productsResponse.data.products);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product: Product) => {
        try {
            await addToCart(product, 1);
            // You can add a toast notification here
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Category Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
                    {category.description && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {category.description}
                        </p>
                    )}
                    <div className="mt-4">
                        <span className="text-gray-500">
                            {products.length} products available
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Search in category..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <Input
                            type="number"
                            placeholder="Min price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        />
                        <Input
                            type="number"
                            placeholder="Max price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        />
                        <Select
                            value={filters.sortBy}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Newest</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="ratings.average">Rating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product._id} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="p-0">
                                <Link href={`/product/${product._id}`}>
                                    <div className="aspect-square overflow-hidden rounded-t-lg">
                                        <img
                                            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Link href={`/product/${product._id}`}>
                                    <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {product.shortDescription || product.description}
                                </p>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${product.price}
                                        </span>
                                        {product.comparePrice && (
                                            <span className="text-sm text-gray-500 line-through ml-2">
                                                ${product.comparePrice}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm text-gray-600 ml-1">
                                            {product.ratings.average.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <span>{product.salesCount} sold</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!product.inStock}
                                    className="w-full"
                                >
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                        <Button asChild className="mt-4">
                            <Link href="/products">Browse All Products</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}