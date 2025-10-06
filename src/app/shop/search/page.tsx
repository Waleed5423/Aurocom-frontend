// src/app/(shop)/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const { addToCart } = useCart();

    const [filters, setFilters] = useState({
        query: initialQuery,
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        featured: false,
        rating: '',
        sortBy: 'relevance',
        sortOrder: 'desc'
    });

    useEffect(() => {
        if (initialQuery) {
            setFilters(prev => ({ ...prev, query: initialQuery }));
        }
    }, [initialQuery]);

    useEffect(() => {
        fetchSearchResults();
        fetchCategories();
    }, [filters]);

    const fetchSearchResults = async () => {
        if (!filters.query.trim() && !filters.category) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.getProducts(filters);
            if (response.success) {
                setProducts(response.data.products);
                setSuggestions(response.data.suggestions || []);
            }
        } catch (error) {
            console.error('Failed to search products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.getCategories();
            if (response.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
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

    const clearFilters = () => {
        setFilters({
            query: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            featured: false,
            rating: '',
            sortBy: 'relevance',
            sortOrder: 'desc'
        });
    };

    const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice ||
        filters.inStock || filters.featured || filters.rating;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {filters.query ? `Search Results for "${filters.query}"` : 'Search Products'}
                        </h1>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Search for products..."
                            value={filters.query}
                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                            className="pl-10 pr-4 py-2 text-lg"
                        />
                    </div>

                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">Try these searches:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setFilters(prev => ({ ...prev, query: suggestion }))}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Categories */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Categories</Label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Availability */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Availability</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="in-stock"
                                                checked={filters.inStock}
                                                onCheckedChange={(checked) => setFilters(prev => ({
                                                    ...prev,
                                                    inStock: checked as boolean
                                                }))}
                                            />
                                            <Label htmlFor="in-stock">In Stock Only</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="featured"
                                                checked={filters.featured}
                                                onCheckedChange={(checked) => setFilters(prev => ({
                                                    ...prev,
                                                    featured: checked as boolean
                                                }))}
                                            />
                                            <Label htmlFor="featured">Featured Products</Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Minimum Rating</Label>
                                    <Select
                                        value={filters.rating}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Any Rating</SelectItem>
                                            <SelectItem value="4">4 Stars & Up</SelectItem>
                                            <SelectItem value="3">3 Stars & Up</SelectItem>
                                            <SelectItem value="2">2 Stars & Up</SelectItem>
                                            <SelectItem value="1">1 Star & Up</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                {loading ? 'Searching...' : `${products.length} products found`}
                            </p>
                            <div className="flex items-center space-x-4">
                                <Select
                                    value={filters.sortBy}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Relevance</SelectItem>
                                        <SelectItem value="price">Price: Low to High</SelectItem>
                                        <SelectItem value="-price">Price: High to Low</SelectItem>
                                        <SelectItem value="name">Name: A to Z</SelectItem>
                                        <SelectItem value="-name">Name: Z to A</SelectItem>
                                        <SelectItem value="ratings.average">Highest Rated</SelectItem>
                                        <SelectItem value="createdAt">Newest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <Card key={index} className="animate-pulse">
                                        <CardHeader className="p-0">
                                            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Results Grid */}
                        {!loading && (
                            <>
                                {products.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                        <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
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
                                ) : (
                                    <div className="text-center py-12">
                                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            No products found
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Try adjusting your search criteria or browse our categories
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <Button asChild>
                                                <Link href="/products">Browse All Products</Link>
                                            </Button>
                                            <Button variant="outline" onClick={clearFilters}>
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}