// src/app/(admin)/layout.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user && user.role === 'customer'))) {
            router.push('/');
        }
    }, [isAuthenticated, user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || (user && user.role === 'customer')) {
        return null;
    }

    const menuItems = [
        { href: '/admin/adashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/aproducts', label: 'Products', icon: '📦' },
        { href: '/admin/acategories', label: 'Categories', icon: '📁' },
        { href: '/admin/aorders', label: 'Orders', icon: '📋' },
        { href: '/admin/ausers', label: 'Users', icon: '👥' },
        { href: '/admin/areviews', label: 'Reviews', icon: '⭐' },
        { href: '/admin/atransactions', label: 'Transactions', icon: '💳' },
        { href: '/admin/acoupons', label: 'Coupons', icon: '🎫' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b">
                    <h1 className={`${sidebarOpen ? 'block' : 'hidden'} text-xl font-bold`}>Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${pathname === item.href
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t">
                    <Link
                        href="/"
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                    >
                        <span className="text-lg">🏠</span>
                        <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                            Back to Shop
                        </span>
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}