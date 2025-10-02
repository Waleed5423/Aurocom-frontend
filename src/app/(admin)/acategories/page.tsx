'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminCategoriesPage() {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
      setEditingCategory(null);
      setFormData({ name: '', description: '', featured: false, isActive: true });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      featured: category.featured,
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', featured: false, isActive: true });
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      await updateCategory(categoryId, { isActive: !currentStatus });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  // Helper function to safely get products count
  const getProductsCount = (category: any): number => {
    return category.productsCount || 0;
  };

  // Helper function to safely get subcategories count
  const getSubcategoriesCount = (category: any): number => {
    return category.subcategories?.length || 0;
  };

  // Check if category can be deleted
  const canDeleteCategory = (category: any): boolean => {
    return getProductsCount(category) === 0 && getSubcategoriesCount(category) === 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <Button onClick={() => setShowForm(true)}>Add Category</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 mb-6 rounded">
          <h3 className="font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
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
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div>Loading categories...</div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
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
                    <span>Products: {getProductsCount(category)}</span>
                    <span>Subcategories: {getSubcategoriesCount(category)}</span>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant={category.isActive ? "outline" : "default"}
                    onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDelete(category._id)}
                    disabled={!canDeleteCategory(category)}
                    title={
                      canDeleteCategory(category) 
                        ? 'Delete category' 
                        : 'Cannot delete category with products or subcategories'
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
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