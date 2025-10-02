'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
    const { products, fetchProducts, updateProductStatus, isLoading } = useAdminStore();
    const [page, setPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        fetchProducts({ page, limit: 10 });
    }, [page]);

    const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
        await updateProductStatus(productId, { isActive: !currentStatus });
        fetchProducts({ page, limit: 10 });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <Button onClick={() => router.push('/aproducts/add')}>
                    Add Product
                </Button>
            </div>

            {isLoading ? (
                <div>Loading products...</div>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <div key={product._id} className="border p-4 rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p>Price: ${product.price}</p>
                                    <p>Stock: {product.quantity}</p>
                                    <p>Status: {product.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        variant={product.isActive ? "destructive" : "default"}
                                        onClick={() => toggleProductStatus(product._id, product.isActive)}
                                    >
                                        {product.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button variant="outline">Edit</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between mt-6">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </Button>
                <Button onClick={() => setPage(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}