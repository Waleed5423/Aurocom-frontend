// src/components/layout/Navbar.tsx - ENHANCED MODERN VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart,
    User,
    Menu,
    X,
    Heart,
    ChevronDown,
    Search,
    Package,
    Trash2,
    Plus,
    Minus,
    Sparkles,
    Store
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout } = useAuth();
    const { cart, itemCount, getCart, removeFromCart, updateCartItem } = useCart();
    const { wishlist } = useUserStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const cartSidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCategories();

        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close cart sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cartSidebarRef.current && !cartSidebarRef.current.contains(event.target as Node)) {
                setCartSidebarOpen(false);
            }
        };

        if (cartSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [cartSidebarOpen]);

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

    const handleLogout = async () => {
        try {
            await logout();
            setMobileMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(itemId, newQuantity);
            await getCart(); // Refresh cart
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            await removeFromCart(itemId);
            await getCart(); // Refresh cart
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const isActivePath = (path: string) => {
        return pathname === path;
    };

    // Don't show navbar on auth pages
    if (pathname.startsWith('/login') ||
        pathname.startsWith('/admin/adashboard') ||
        pathname.startsWith('/admin/aproducts') ||
        pathname.startsWith('/admin/acategories') ||
        pathname.startsWith('/admin/aorders') ||
        pathname.startsWith('/admin/ausers') ||
        pathname.startsWith('/admin/areviews') ||
        pathname.startsWith('/admin/atransactions') ||
        pathname.startsWith('/admin/coupons') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/verify-email')) {
        return null;
    }

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 transition-all duration-500 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Aurocom
                                </span>
                                <span className="text-xs text-gray-500 -mt-1">Premium Store</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <Link
                                href="/shop/products"
                                className={`relative font-medium transition-all duration-300 hover:text-blue-600 px-3 py-2 rounded-lg ${isActivePath('/shop/products')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Products
                                {isActivePath('/shop/products') && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                        layoutId="navbar-indicator"
                                    />
                                )}
                            </Link>

                            <div className="relative group">
                                <button className="flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-50">
                                    <span>Categories</span>
                                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                                </button>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                                >
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Store className="h-4 w-4 mr-2 text-blue-600" />
                                            Shop by Category
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.slice(0, 6).map((category) => (
                                                <Link
                                                    key={category._id}
                                                    href={`/shop/category/${category._id}`}
                                                    className="group/category flex items-center space-x-2 py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                                                >
                                                    {category.image ? (
                                                        <img
                                                            src={category.image.url}
                                                            alt={category.name}
                                                            className="w-6 h-6 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                                                            <Package className="h-3 w-3 text-blue-600" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium">{category.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                        <Link
                                            href="/shop/categories"
                                            className="block w-full mt-3 py-2 px-3 text-center text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300 border border-blue-200"
                                        >
                                            View All Categories →
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>

                            <Link
                                href="/about"
                                className={`relative font-medium transition-all duration-300 hover:text-blue-600 px-3 py-2 rounded-lg ${isActivePath('/about')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                About
                                {isActivePath('/about') && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                        layoutId="navbar-indicator"
                                    />
                                )}
                            </Link>

                            <Link
                                href="/contact"
                                className={`relative font-medium transition-all duration-300 hover:text-blue-600 px-3 py-2 rounded-lg ${isActivePath('/contact')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Contact
                                {isActivePath('/contact') && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                        layoutId="navbar-indicator"
                                    />
                                )}
                            </Link>
                        </nav>

                        {/* User Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg"
                            >
                                <Search className="h-5 w-5" />
                            </motion.button>

                            {/* Wishlist */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/wishlist"
                                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg"
                                >
                                    <Heart className="h-5 w-5" />
                                    {wishlist.length > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                                        >
                                            {wishlist.length}
                                        </motion.span>
                                    )}
                                </Link>
                            </motion.div>

                            {/* Cart with Modern Sidebar */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCartSidebarOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* User Account */}
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                    </motion.button>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                                    >
                                        <div className="p-2">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                                            >
                                                <User className="h-4 w-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link
                                                href="/orders"
                                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                                            >
                                                <Package className="h-4 w-4" />
                                                <span>My Orders</span>
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                                            >
                                                <User className="h-4 w-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                                            >
                                                <X className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <Button asChild variant="ghost" size="sm" className="rounded-lg">
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                    <Button asChild size="sm" className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                        <Link href="/register">Sign Up</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur-md overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
                                <Link
                                    href="/shop/products"
                                    className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-300 py-2"
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
                                                href={`/shop/category/${category._id}`}
                                                className="flex items-center space-x-2 py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 text-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {category.image ? (
                                                    <img
                                                        src={category.image.url}
                                                        alt={category.name}
                                                        className="w-5 h-5 object-cover rounded"
                                                    />
                                                ) : (
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                )}
                                                <span>{category.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href="/shop/categories"
                                        className="block mt-3 py-2 px-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300 text-sm border border-blue-200 text-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        View All Categories
                                    </Link>
                                </div>

                                <Link
                                    href="/about"
                                    className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-300 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    href="/contact"
                                    className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-300 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact
                                </Link>

                                {!isAuthenticated && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <Button asChild className="w-full mb-2 rounded-lg">
                                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                                Sign In
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full rounded-lg">
                                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                                Sign Up
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search for products, brands, and more..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-lg border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Search
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modern Cart Sidebar */}
            <AnimatePresence>
                {cartSidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            onClick={() => setCartSidebarOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            ref={cartSidebarRef}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl"
                        >
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Shopping Cart ({itemCount})
                                        </h2>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setCartSidebarOpen(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>

                                {/* Cart Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {cart && cart.items.length > 0 ? (
                                        <div className="p-6 space-y-4">
                                            {cart.items.map((item) => (
                                                <motion.div
                                                    key={item._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                                                >
                                                    <img
                                                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 truncate">
                                                            {item.product.name}
                                                        </h3>
                                                        {item.variant && (
                                                            <p className="text-sm text-gray-500">
                                                                {item.variant.name}: {item.variant.value}
                                                            </p>
                                                        )}
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            ${item.price}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-300"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </motion.button>
                                                        <span className="w-8 text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-300"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                            <ShoppingCart className="h-24 w-24 text-gray-300 mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Your cart is empty
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                Start shopping to add items to your cart
                                            </p>
                                            <Button
                                                asChild
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                onClick={() => setCartSidebarOpen(false)}
                                            >
                                                <Link href="/shop/products">
                                                    Start Shopping
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {cart && cart.items.length > 0 && (
                                    <div className="border-t border-gray-200 p-6 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">${cart.subtotal?.toFixed(2)}</span>
                                            </div>
                                            {cart.discount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Discount</span>
                                                    <span>-${cart.discount?.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                <span>Total</span>
                                                <span>${cart.total?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button
                                                asChild
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                <Link href="/shop/checkout" onClick={() => setCartSidebarOpen(false)}>
                                                    Checkout
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setCartSidebarOpen(false)}
                                            >
                                                <Link href="/shop/cart">
                                                    View Cart
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}