// src/app/admin/aproducts/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminStore } from '@/store/useAdminStore';
import { Product, ProductVariant } from '@/types';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const { categories, fetchCategories, products } = useAdminStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        comparePrice: '',
        cost: '',
        category: '',
        subcategory: '',
        sku: '',
        quantity: '',
        lowStockAlert: '5',
        weight: '',
        brand: '',
        tags: '',
        featured: false,
        trackQuantity: true
    });

    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

    useEffect(() => {
        const initializePage = async () => {
            await fetchCategories();

            // Find the product to edit
            const productToEdit = products.find(p => p._id === productId);
            if (productToEdit) {
                // Populate form with existing product data
                setFormData({
                    name: productToEdit.name,
                    description: productToEdit.description,
                    shortDescription: productToEdit.shortDescription || '',
                    price: productToEdit.price.toString(),
                    comparePrice: productToEdit.comparePrice?.toString() || '',
                    cost: productToEdit.cost?.toString() || '',
                    category: typeof productToEdit.category === 'string' ? productToEdit.category : productToEdit.category._id,
                    subcategory: productToEdit.subcategory ?
                        (typeof productToEdit.subcategory === 'string' ? productToEdit.subcategory : productToEdit.subcategory._id) : '',
                    sku: productToEdit.sku,
                    quantity: productToEdit.quantity.toString(),
                    lowStockAlert: productToEdit.lowStockAlert.toString(),
                    weight: productToEdit.weight?.toString() || '',
                    brand: productToEdit.brand || '',
                    tags: productToEdit.tags?.join(', ') || '',
                    featured: productToEdit.featured,
                    trackQuantity: productToEdit.trackQuantity
                });

                if (productToEdit.variants) {
                    setVariants(productToEdit.variants);
                }
            }
            setIsLoading(false);
        };

        initializePage();
    }, [productId, products]);

    // Update subcategories when category changes
    useEffect(() => {
        if (formData.category) {
            const subs = categories.filter(cat => {
                if (cat.parent) {
                    if (typeof cat.parent === 'string') {
                        return cat.parent === formData.category;
                    } else {
                        return cat.parent._id === formData.category;
                    }
                }
                return false;
            });
            setAvailableSubcategories(subs);
        } else {
            setAvailableSubcategories([]);
        }
    }, [formData.category, categories]);

    // Variant Management Functions (same as add page)
    const addVariant = () => {
        setVariants(prev => [...prev, { name: '', values: [] }]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariantName = (index: number, name: string) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? { ...variant, name } : variant
        ));
    };

    const addVariantValue = (variantIndex: number) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex
                ? { ...variant, values: [...variant.values, { value: '', price: 0, stock: 0 }] }
                : variant
        ));
    };

    const removeVariantValue = (variantIndex: number, valueIndex: number) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex
                ? { ...variant, values: variant.values.filter((_, j) => j !== valueIndex) }
                : variant
        ));
    };

    const updateVariantValue = (variantIndex: number, valueIndex: number, field: string, value: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex
                ? {
                    ...variant,
                    values: variant.values.map((val, j) =>
                        j === valueIndex ? { ...val, [field]: value } : val
                    )
                }
                : variant
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Prepare product data for update
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                cost: formData.cost ? parseFloat(formData.cost) : undefined,
                quantity: parseInt(formData.quantity),
                lowStockAlert: parseInt(formData.lowStockAlert),
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                featured: Boolean(formData.featured),
                trackQuantity: Boolean(formData.trackQuantity),
                variants: variants.filter(variant => variant.name && variant.values.length > 0),
                ...(formData.subcategory && { subcategory: formData.subcategory })
            };

            // API call to update product
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('Product updated successfully!');
                    router.push('/admin/aproducts');
                } else {
                    throw new Error(result.message || 'Failed to update product');
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product: ' + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Get main categories (no parent)
    const getMainCategories = () => {
        return categories.filter(cat => !cat.parent);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div>Loading product data...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <Button variant="outline" onClick={() => router.push('/admin/aproducts')}>
                    Back to Products
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Basic Information */}
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Product Name *</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter product name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">SKU</label>
                            <Input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Short Description</label>
                            <Textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                placeholder="Brief description for product listings"
                                rows={2}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Full Description *</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Detailed product description"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Organization */}
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-4">Organization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                                required
                            >
                                <option value="">Select Category</option>
                                {getMainCategories().map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subcategory</label>
                            <select
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                                disabled={!formData.category}
                            >
                                <option value="">No Subcategory</option>
                                {availableSubcategories.map(subcategory => (
                                    <option key={subcategory._id} value={subcategory._id}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Brand</label>
                            <Input
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Brand name"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <Input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="Separate tags with commas"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Price *</label>
                            <Input
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Compare Price</label>
                            <Input
                                type="number"
                                step="0.01"
                                name="comparePrice"
                                value={formData.comparePrice}
                                onChange={handleChange}
                                placeholder="Original price"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Cost</label>
                            <Input
                                type="number"
                                step="0.01"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                placeholder="Product cost"
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-4">Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity *</label>
                            <Input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
                            <Input
                                type="number"
                                name="lowStockAlert"
                                value={formData.lowStockAlert}
                                onChange={handleChange}
                                placeholder="5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                            <Input
                                type="number"
                                step="0.01"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="trackQuantity"
                                checked={formData.trackQuantity}
                                onChange={handleChange}
                            />
                            <span>Track Quantity</span>
                        </label>
                    </div>
                </div>

                {/* Variants Section */}
                <div className="border p-4 rounded">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Product Variants</h2>
                        <Button type="button" variant="outline" onClick={addVariant}>
                            Add Variant
                        </Button>
                    </div>

                    {variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="border p-4 rounded mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <Input
                                    placeholder="Variant name (e.g., Size, Color)"
                                    value={variant.name}
                                    onChange={(e) => updateVariantName(variantIndex, e.target.value)}
                                    className="max-w-xs"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeVariant(variantIndex)}
                                >
                                    Remove Variant
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {variant.values.map((value, valueIndex) => (
                                    <div key={valueIndex} className="flex gap-3 items-center">
                                        <Input
                                            placeholder="Value (e.g., Small, Red)"
                                            value={value.value}
                                            onChange={(e) => updateVariantValue(variantIndex, valueIndex, 'value', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price"
                                            value={value.price}
                                            onChange={(e) => updateVariantValue(variantIndex, valueIndex, 'price', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Stock"
                                            value={value.stock}
                                            onChange={(e) => updateVariantValue(variantIndex, valueIndex, 'stock', parseInt(e.target.value))}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addVariantValue(variantIndex)}
                                >
                                    Add Value
                                </Button>
                            </div>
                        </div>
                    ))}

                    {variants.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                            No variants added. Add variants like sizes, colors, etc.
                        </p>
                    )}
                </div>

                {/* Options */}
                <div className="border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-4">Options</h2>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                            />
                            <span>Featured Product</span>
                        </label>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Updating Product...' : 'Update Product'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/aproducts')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}