// src/app/shop/products/page.tsx - ENHANCED
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  Grid3X3,
  List,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
    featured: false,
    rating: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    tags: [] as string[],
    brand: ''
  });

  // Available price ranges for quick selection
  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: 'Over $200', min: 200, max: 1000 }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProducts(filters);
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

  const handleQuickView = (product: Product) => {
    // Implement quick view modal
    console.log('Quick view:', product.name);
  };

  const handleAddToWishlist = (product: Product) => {
    // Implement wishlist functionality
    console.log('Add to wishlist:', product.name);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      inStock: false,
      featured: false,
      rating: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      tags: [],
      brand: ''
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice > 0 || filters.maxPrice < 1000 ||
    filters.inStock || filters.featured || filters.rating > 0 || filters.tags.length > 0 || filters.brand;

  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent);
  };

  const getBrands = () => {
    const brands = new Set(
      products
        .map(product => product.brand)
        .filter((brand): brand is string => Boolean(brand)) // Type guard to ensure string
    );
    return Array.from(brands);
  };

  const getPopularTags = () => {
    const allTags = products.flatMap(product => product.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing products with unbeatable quality and prices.
              Shop with confidence and enjoy fast delivery.
            </p>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border sticky top-24">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Search */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Categories</Label>
                  <div className="space-y-2">
                    {getMainCategories().map((category) => (
                      <div key={category._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category._id}`}
                          checked={filters.category === category._id}
                          onCheckedChange={(checked) =>
                            setFilters(prev => ({
                              ...prev,
                              category: checked ? category._id : ''
                            }))
                          }
                        />
                        <Label htmlFor={`category-${category._id}`} className="flex-1 text-sm">
                          {category.name}
                          {category.productsCount && (
                            <span className="text-gray-500 ml-1">
                              ({category.productsCount})
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Price Range: ${filters.minPrice} - ${filters.maxPrice}
                  </Label>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setFilters(prev => ({
                      ...prev,
                      minPrice: value[0],
                      maxPrice: value[1]
                    }))}
                    className="mb-4"
                  />
                  <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <button
                        key={index}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          minPrice: range.min,
                          maxPrice: range.max
                        }))}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${filters.minPrice === range.min && filters.maxPrice === range.max
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {getBrands().length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Brands</Label>
                    <Select
                      value={filters.brand || "all"} // Use "all" instead of empty string
                      onValueChange={(value) => setFilters(prev => ({
                        ...prev,
                        brand: value === "all" ? "" : value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem> {/* Changed from "" to "all" */}
                        {getBrands().map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Customer Rating</Label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={filters.rating === rating}
                          onCheckedChange={(checked) =>
                            setFilters(prev => ({
                              ...prev,
                              rating: checked ? rating : 0
                            }))
                          }
                        />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                          <span className="ml-1">& Up</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Availability</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => setFilters(prev => ({
                          ...prev,
                          inStock: checked as boolean
                        }))}
                      />
                      <Label htmlFor="in-stock" className="text-sm">
                        In Stock Only
                      </Label>
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
                      <Label htmlFor="featured" className="text-sm">
                        Featured Products
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Popular Tags */}
                {getPopularTags().length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Popular Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {getPopularTags().map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tag)
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }))}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${filters.tags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-sm">Free Shipping</h3>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-sm">Secure Payment</h3>
                    <p className="text-xs text-gray-600">100% secure payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <p className="text-sm text-gray-600">
                    {loading ? 'Searching...' : `Found ${products.length} products`}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex border rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="-price">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                      <SelectItem value="-name">Name: Z to A</SelectItem>
                      <SelectItem value="ratings.average">Highest Rated</SelectItem>
                      <SelectItem value="salesCount">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, index) => (
                  <ProductCardSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or browse our categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild>
                      <Link href="/shop/products">Browse All Products</Link>
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Mobile filters content would go here - you can reuse the filter components */}
          </div>
        </div>
      )}
    </div>
  );
}

// Product Card Component
const ProductCard = ({
  product,
  viewMode,
  onAddToCart,
  onQuickView,
  onAddToWishlist
}: {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
}) => {
  const isGrid = viewMode === 'grid';

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden ${isGrid ? '' : 'flex'
      }`}>
      {/* Product Image */}
      <div className={`relative overflow-hidden ${isGrid ? 'aspect-square' : 'w-48 flex-shrink-0'}`}>
        <Link href={`/shop/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {product.featured && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
              Featured
            </Badge>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
              Save ${(product.comparePrice - product.price).toFixed(0)}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onAddToWishlist(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onQuickView(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-4 flex-1 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div>
          <Link href={`/shop/product/${product._id}`}>
            <h3 className={`font-semibold hover:text-blue-600 transition-colors line-clamp-2 ${isGrid ? 'text-lg mb-2' : 'text-xl mb-3'
              }`}>
              {product.name}
            </h3>
          </Link>

          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
            {product.shortDescription || product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(product.ratings.average)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({product.ratings.count})
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-gray-900 ${isGrid ? 'text-xl' : 'text-2xl'}`}>
                ${product.price}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.comparePrice}
                </span>
              )}
            </div>
            <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className="flex-1"
              size={isGrid ? "default" : "lg"}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Skeleton Loader
const ProductCardSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => {
  const isGrid = viewMode === 'grid';

  return (
    <Card className={`animate-pulse border-0 shadow-sm ${isGrid ? '' : 'flex'}`}>
      <div className={`bg-gray-200 ${isGrid ? 'aspect-square' : 'w-48 flex-shrink-0'}`} />
      <div className={`p-4 flex-1 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </Card>
  );
};