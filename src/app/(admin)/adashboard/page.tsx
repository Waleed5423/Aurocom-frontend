'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
    const { dashboardStats, fetchDashboardStats, isLoading } = useAdminStore();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl">{dashboardStats.stats.totalUsers}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl">{dashboardStats.stats.totalProducts}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl">{dashboardStats.stats.totalOrders}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl">${dashboardStats.stats.totalRevenue}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboardStats?.recentOrders?.map((order) => (
                            <div key={order._id} className="border-b py-2">
                                <p>Order: {order.orderNumber}</p>
                                <p>Status: {order.status}</p>
                                <p>Total: ${order.total}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboardStats?.lowStockProducts?.map((product) => (
                            <div key={product._id} className="border-b py-2">
                                <p>{product.name}</p>
                                <p>Stock: {product.quantity}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}