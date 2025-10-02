// src/app/(admin)/adashboard/page.tsx - FIXED VERSION
'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { dashboardStats, fetchDashboardStats, isLoading } = useAdminStore();
    const [timeRange, setTimeRange] = useState('today');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6">
                <div>Loading dashboard...</div>
            </div>
        );
    }

    const quickActions = [
        { href: '/admin/aproducts/add', label: 'Add Product', icon: '➕' },
        { href: '/admin/acategories', label: 'Manage Categories', icon: '📁' },
        { href: '/admin/aorders', label: 'View Orders', icon: '📋' },
        { href: '/admin/acoupons', label: 'Create Coupon', icon: '🎫' },
    ];

    // Safe access to dashboard stats with fallbacks
    const stats = dashboardStats?.stats || {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockCount: 0
    };

    const recentOrders = dashboardStats?.recentOrders || [];
    const lowStockProducts = dashboardStats?.lowStockProducts || [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex space-x-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl mb-2">{action.icon}</div>
                                <p className="font-medium">{action.label}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        <p className="text-xs text-gray-500">Registered users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalProducts}</p>
                        <p className="text-xs text-gray-500">Active products</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        <p className="text-xs text-gray-500">All-time orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Lifetime revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.slice(0, 5).map((order) => (
                                    <div key={order._id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium">#{order.orderNumber}</p>
                                            <p className="text-sm text-gray-600">
                                                {order.user?.name || 'Customer'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">${order.total}</p>
                                            <span className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent orders</p>
                        )}
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/aorders">View All Orders</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Low Stock Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-3">
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <div key={product._id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Stock: {product.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                                Low Stock
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No low stock products</p>
                        )}
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/aproducts">Manage Products</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}