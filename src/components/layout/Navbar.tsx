// src/components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    Heart,
    ChevronDown
} from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout } = useAuth();
    const { itemCount } = useCart();
    const { wishlist } = useUserStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchCategories();

        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setMobileMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActivePath = (path: string) => {
        return pathname === path;
    };

    return (
        <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-300 ${scrolled ? 'shadow-md' : ''
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Bar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Aurocom</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link
                            href="/products"
                            className={`font-medium transition-colors hover:text-blue-600 ${isActivePath('/products') ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Products
                        </Link>
                        <div className="relative group">
                            <button className="flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                <span>Categories</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Shop by Category</h3>
                                    <div className="space-y-2">
                                        {categories.slice(0, 6).map((category) => (
                                            <Link
                                                key={category._id}
                                                href={`/category/${category._id}`}
                                                className="block py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                        <Link
                                            href="/categories"
                                            className="block py-2 px-3 text-blue-600 font-medium hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            View All Categories →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/about"
                            className={`font-medium transition-colors hover:text-blue-600 ${isActivePath('/about') ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className={`font-medium transition-colors hover:text-blue-600 ${isActivePath('/contact') ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:block flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative">
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 w-full"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </form>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Button - Mobile */}
                        <button
                            className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                        >
                            <Heart className="h-5 w-5" />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Account */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:block text-sm font-medium">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <div className="p-2">
                                        <Link
                                            href="/dashboard"
                                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-2">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {mobileMenuOpen && (
                    <div className="lg:hidden pb-4">
                        <form onSubmit={handleSearch} className="relative">
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 w-full"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-6 space-y-4">
                        <Link
                            href="/products"
                            className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Products
                        </Link>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.slice(0, 6).map((category) => (
                                    <Link
                                        key={category._id}
                                        href={`/category/${category._id}`}
                                        className="block py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                            <Link
                                href="/categories"
                                className="block mt-3 py-2 px-3 text-blue-600 font-medium hover:bg-blue-50 rounded-md transition-colors text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                View All Categories
                            </Link>
                        </div>

                        <Link
                            href="/about"
                            className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact
                        </Link>

                        {!isAuthenticated && (
                            <div className="pt-4 border-t border-gray-200">
                                <Button asChild className="w-full mb-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        Sign Up
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}