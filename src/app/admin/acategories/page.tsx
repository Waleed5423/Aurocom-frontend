// src/app/admin/acategories/page.tsx - UPDATED
'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminCategoriesPage() {
    const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
    const [showForm, setShowForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [parentCategory, setParentCategory] = useState<any>(null);
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

        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
            } else {
                await createCategory(formData);
            }

            setShowForm(false);
            setShowSubcategoryForm(false);
            setEditingCategory(null);
            setParentCategory(null);
            setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
            fetchCategories(); // Refresh the list
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    // Helper function to get subcategories for a parent category
    const getSubcategories = (categoryId: string) => {
        return categories.filter(cat =>
            cat.parent &&
            (typeof cat.parent === 'string'
                ? cat.parent === categoryId
                : cat.parent._id === categoryId)
        );
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
                    <Button onClick={() => setShowForm(true)}>Add Category</Button>
                </div>
            </div>

            {/* Form for adding/editing categories */}
            {(showForm || showSubcategoryForm) && (
                <form onSubmit={handleSubmit} className="border p-4 mb-6 rounded">
                    <h3 className="font-semibold mb-4">
                        {showSubcategoryForm ? `Add Subcategory to ${parentCategory?.name}` :
                            editingCategory ? 'Edit Category' : 'Add New Category'}
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                placeholder="Category description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        {!showSubcategoryForm && !editingCategory && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Parent Category (Optional)</label>
                                <select
                                    value={formData.parent}
                                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="">No Parent (Main Category)</option>
                                    {getMainCategories().map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                />
                                <span>Featured Category</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                        <Button type="submit">
                            {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                            setShowForm(false);
                            setShowSubcategoryForm(false);
                            setEditingCategory(null);
                            setParentCategory(null);
                            setFormData({ name: '', description: '', parent: '', featured: false, isActive: true });
                        }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div>Loading categories...</div>
            ) : (
                <div className="space-y-6">
                    {getMainCategories().map((category) => (
                        <div key={category._id}>
                            <div className="border p-4 rounded">
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
                                        <p className="text-gray-600">{category.description}</p>
                                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                                            <span>Subcategories: {getSubcategories(category._id).length}</span>
                                        </div>
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
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
                                            }}
                                        >
                                            Add Subcategory
                                        </Button>
                                        <Button
                                            variant={category.isActive ? "outline" : "default"}
                                            onClick={() => updateCategory(category._id, { isActive: !category.isActive })}
                                        >
                                            {category.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setFormData({
                                                    name: category.name,
                                                    description: category.description || '',
                                                    parent: category.parent || '',
                                                    featured: category.featured,
                                                    isActive: category.isActive
                                                });
                                                setShowForm(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => deleteCategory(category._id)}
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
                                                    <p className="text-sm text-gray-600">{subcategory.description}</p>
                                                </div>
                                                <div className="space-x-2">
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
                                                                parent: subcategory.parent || '',
                                                                featured: subcategory.featured,
                                                                isActive: subcategory.isActive
                                                            });
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteCategory(subcategory._id)}
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
                <div className="text-center py-8 text-gray-500">
                    No categories found. Create your first category to get started.
                </div>
            )}
        </div>
    );
}