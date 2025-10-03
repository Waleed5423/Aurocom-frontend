// src/app/admin/acategories/page.tsx - UPDATED CATEGORY CREATION LOGIC
'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
    const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
    const [showForm, setShowForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [parentCategory, setParentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent: '',
        featured: false,
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) {
            alert('Category name is required');
            return;
        }

        try {
            // Prepare category data - only include parent if creating a subcategory
            const categoryData = {
                name: formData.name,
                description: formData.description,
                featured: formData.featured,
                isActive: formData.isActive,
                // Only include parent if we're creating a subcategory
                ...(showSubcategoryForm && { parent: formData.parent })
            };

            if (editingCategory) {
                await updateCategory(editingCategory._id, categoryData);
            } else {
                await createCategory(categoryData);
            }

            setShowForm(false);
            setShowSubcategoryForm(false);
            setEditingCategory(null);
            setParentCategory(null);
            setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category. Please check the console for details.');
        }
    };

    // Helper function to get subcategories for a parent category
    const getSubcategories = (categoryId: string) => {
        return categories.filter(cat => {
            if (cat.parent) {
                if (typeof cat.parent === 'string') {
                    return cat.parent === categoryId;
                } else {
                    return cat.parent._id === categoryId;
                }
            }
            return false;
        });
    };

    // Helper function to get main categories (no parent)
    const getMainCategories = () => {
        return categories.filter(cat => !cat.parent);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories Management</h1>
                <div className="space-x-2">
                    <Button onClick={() => {
                        setShowForm(true);
                        setShowSubcategoryForm(false);
                        setEditingCategory(null);
                        setParentCategory(null);
                        setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
                    }}>
                        Add Main Category
                    </Button>
                </div>
            </div>

            {/* Form for adding main categories */}
            {showForm && !showSubcategoryForm && (
                <form onSubmit={handleSubmit} className="border p-4 mb-6 rounded bg-white shadow-sm">
                    <h3 className="font-semibold mb-4 text-lg">
                        {editingCategory ? 'Edit Category' : 'Add New Main Category'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category Name *</label>
                            <Input
                                type="text"
                                placeholder="Category Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                placeholder="Category description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span>Featured Category</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create') + ' Category'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowForm(false);
                                setEditingCategory(null);
                                setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {/* Form for adding subcategories */}
            {showSubcategoryForm && (
                <form onSubmit={handleSubmit} className="border p-4 mb-6 rounded bg-white shadow-sm">
                    <h3 className="font-semibold mb-4 text-lg">
                        Add Subcategory to {parentCategory?.name}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Subcategory Name *</label>
                            <Input
                                type="text"
                                placeholder="Subcategory Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                placeholder="Subcategory description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span>Featured</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Subcategory'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowSubcategoryForm(false);
                                setParentCategory(null);
                                setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {isLoading && !showForm && !showSubcategoryForm ? (
                <div className="text-center py-8">Loading categories...</div>
            ) : (
                <div className="space-y-6">
                    {getMainCategories().map((category) => (
                        <div key={category._id}>
                            <div className="border p-4 rounded bg-white shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-semibold text-lg">{category.name}</h3>
                                            {category.featured && (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    Featured
                                                </span>
                                            )}
                                            {!category.isActive && (
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        {category.description && (
                                            <p className="text-gray-600 mb-2">{category.description}</p>
                                        )}
                                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                                            <span>Subcategories: {getSubcategories(category._id).length}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setParentCategory(category);
                                                setFormData({
                                                    name: '',
                                                    description: '',
                                                    parent: category._id,
                                                    featured: false,
                                                    isActive: true
                                                });
                                                setShowSubcategoryForm(true);
                                                setShowForm(false);
                                            }}
                                        >
                                            Add Subcategory
                                        </Button>
                                        <Button
                                            variant={category.isActive ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => updateCategory(category._id, { isActive: !category.isActive })}
                                        >
                                            {category.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setFormData({
                                                    name: category.name,
                                                    description: category.description || '',
                                                    parent: '',
                                                    featured: category.featured,
                                                    isActive: category.isActive
                                                });
                                                setShowForm(true);
                                                setShowSubcategoryForm(false);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                                                    deleteCategory(category._id);
                                                }
                                            }}
                                            disabled={getSubcategories(category._id).length > 0}
                                            title={
                                                getSubcategories(category._id).length > 0
                                                    ? 'Cannot delete category with subcategories'
                                                    : 'Delete category'
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {getSubcategories(category._id).length > 0 && (
                                <div className="ml-8 mt-2 space-y-2">
                                    {getSubcategories(category._id).map(subcategory => (
                                        <div key={subcategory._id} className="border-l-2 border-gray-200 pl-4 py-2">
                                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                                <div>
                                                    <h4 className="font-medium">{subcategory.name}</h4>
                                                    {subcategory.description && (
                                                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant={subcategory.isActive ? "outline" : "default"}
                                                        size="sm"
                                                        onClick={() => updateCategory(subcategory._id, { isActive: !subcategory.isActive })}
                                                    >
                                                        {subcategory.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingCategory(subcategory);
                                                            setFormData({
                                                                name: subcategory.name,
                                                                description: subcategory.description || '',
                                                                parent: typeof subcategory.parent === 'string' ? subcategory.parent : subcategory.parent?._id || '',
                                                                featured: subcategory.featured,
                                                                isActive: subcategory.isActive
                                                            });
                                                            setShowForm(true);
                                                            setShowSubcategoryForm(false);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete "${subcategory.name}"?`)) {
                                                                deleteCategory(subcategory._id);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {categories.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <p className="mb-4">No categories found.</p>
                    <Button onClick={() => setShowForm(true)}>
                        Create Your First Category
                    </Button>
                </div>
            )}
        </div>
    );
}