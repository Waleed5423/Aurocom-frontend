// src/app/admin/aproducts/page.tsx - UPDATED WITH DELETE
'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
    const { products, fetchProducts, updateProductStatus, deleteProduct, isLoading } = useAdminStore();
    const [page, setPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        fetchProducts({ page, limit: 10 });
    }, [page]);

    const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
        await updateProductStatus(productId, { isActive: !currentStatus });
        fetchProducts({ page, limit: 10 });
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            try {
                await deleteProduct(productId);
                fetchProducts({ page, limit: 10 });
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <Button onClick={() => router.push('/admin/aproducts/add')}>
                    Add Product
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading products...</div>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <div key={product._id} className="border p-4 rounded bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4 flex-1">
                                    {product.images && product.images.length > 0 && (
                                        <img
                                            src={product.images.find(img => img.isDefault)?.url || product.images[0]?.url}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{product.name}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                            <div>
                                                <span className="font-medium">Price:</span> ${product.price}
                                            </div>
                                            <div>
                                                <span className="font-medium">Stock:</span> {product.quantity}
                                            </div>
                                            <div>
                                                <span className="font-medium">Status:</span>
                                                <span className={`ml-1 ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">SKU:</span> {product.sku}
                                            </div>
                                        </div>
                                        {product.variants && product.variants.length > 0 && (
                                            <p className="text-sm text-blue-600 mt-1">
                                                Variants: {product.variants.length}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        variant={product.isActive ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => toggleProductStatus(product._id, product.isActive)}
                                    >
                                        {product.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/aproducts/edit/${product._id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteProduct(product._id, product.name)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {products.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <p className="mb-4">No products found.</p>
                    <Button onClick={() => router.push('/admin/aproducts/add')}>
                        Create Your First Product
                    </Button>
                </div>
            )}

            <div className="flex justify-between items-center mt-6">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </Button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <Button onClick={() => setPage(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}